var prompts = require('../prompts');
var search = require('../jobsearchlogic');
var builder = require('botbuilder');

/** Return a LuisDialog that points at our model and then add intent handlers. */
var model = process.env.model || 'https://api.projectoxford.ai/luis/v1/application?id=a0e8a29a-a175-4b71-b659-f0b8cdca52ce&subscription-key=08feb824df5a47ba8d3b818aa3235a9f&q=';
var dialog = new builder.LuisDialog(model);
module.exports = dialog;


/*INTENTS:
 * 
-Introduction
-JobView
-FindJobs
-Help
-Employer
None
 */

dialog.on('None', builder.DialogAction.send("Sorry, I didn't get that."));


/** Answer users help requests. We can use a DialogAction to send a static message. */
dialog.on('Help', builder.DialogAction.send(prompts.helpMessage));

dialog.on('Introduction', [

]);

/** Prompts a user for the job title and do the search  */
dialog.on('FindJobs', [
    function (session, args, next) {

        var pTitle, pWhere, pKeywords, pCompanyName, pDuration;

        // See if got the tasks jobtitle from our LUIS model.
        var title = builder.EntityRecognizer.findEntity(args.entities, 'Title');
        var where = builder.EntityRecognizer.findEntity(args.entities, 'builtin.geography.city');
        var keywords = builder.EntityRecognizer.findEntity(args.entities, 'Category');
        var companyName = builder.EntityRecognizer.findEntity(args.entities, 'Company');
        var duration = builder.EntityRecognizer.findEntity(args.entities, 'builtin.');

        if (!title) {
            // Prompt user to enter title.
            //builder.Prompts.text(session, prompts.missingJobTitle);
            pTitle = "";
        } else {
            pTitle = title.entity;
        }

        if (!where) {
            pWhere = "";
        } else {
            pWhere = where.entity;
        }
        
        if (!keywords) {
            pKeywords = "";
        } else {
            pKeywords = where.entity;
        }
        
        if (!companyName) {
            pCompanyName = "";
        } else {
            pCompanyName = companyName.entity;
        }
        
        if (!duration) {
            pDuration = -1;
        } else {
            pDuration = duration.entity;
        }

        // Pass title to next step.
        next({
            title: pTitle,
            where: pWhere,
            keywords: pKeywords,
            companyName: pCompanyName,
            duration: pDuration
        });
    },
    function (session, results) {
        
        search.doSearch(results.title, results.where, results.companyName,
             results.duration, results.keywords,
             function (sr) {
            
            if (sr.RecordsFound == 0) {
                session.send('Sorry, no jobs like this in our database.');
            } else if (sr.RecordsFound == 1) {
                session.send('There is only one job that matches your criteria.');
                showJobDetail(session, sr, false, false);

            } else {
                session.send('We have ' + sr.RecordsFound + ' jobs in our database.');
                showJobDetail(session, sr, false, true);
            }
        });
    }
]);

function showJobDetail(session, sr, isFirst, offerNext) {
    var company = sr.Items[0].CompanyName;
    var title = sr.Items[0].Title;
    var where = sr.Items[0].City;
    var jobId = sr.Items[0].Id;
    
    if (isFirst) {
        session.send('The best one that matches your criteria is:');
    }

    session.send(company + ' is looking for ' + title + ' in ' + where + '. Please find job details below.');
    session.userData.JobId = jobId;

    if (offerNext) {
        session.send('Feel free to ask for next job if you do not like this one.');
    }
}

/** Finds out the user's intent is to find an employee */
dialog.on('Employer', [
    function (session, args, next) {
        // Do we have any tasks?
        if (session.userData.tasks && session.userData.tasks.length > 0) {
            // See if got the tasks title from our LUIS model.
            var topTask;
            var title = builder.EntityRecognizer.findEntity(args.entities, 'TaskTitle');
            if (title) {
                // Find it in our list of tasks
                topTask = builder.EntityRecognizer.findBestMatch(session.userData.tasks, title.entity);
            }
            
            // Prompt user if task missing or not found
            if (!topTask) {
                builder.Prompts.choice(session, prompts.finishTaskMissing, session.userData.tasks);
            } else {
                next({ response: topTask });
            }
        } else {
            session.send(prompts.listNoTasks);
        }
    },
    function (session, results) {
        if (results && results.response) {
            session.userData.tasks.splice(results.response.index, 1);
            session.send(prompts.finishTaskDone, { task: results.response.entity });
        } else {
            session.send(prompts.canceled);
        }
    }
]);

/** Shows the user a concrete job. */
dialog.on('JobView', function (session) {
    if (session.userData.tasks && session.userData.tasks.length > 0) {
        var list = '';
        session.userData.tasks.forEach(function (value, index) {
            list += session.gettext(prompts.listTaskItem, { index: index + 1, task: value });
        });
        session.send(prompts.listTaskList, list);
    }
    else {
        session.send(prompts.listNoTasks);
    }
});
