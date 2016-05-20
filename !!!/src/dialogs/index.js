var prompts = require('../prompts');
var search = require('../jobsearchlogic');
var builder = require('botbuilder');

/** Return a LuisDialog that points at our model and then add intent handlers. */
var model = process.env.model || 'https://api.projectoxford.ai/luis/v1/application?id=a0e8a29a-a175-4b71-b659-f0b8cdca52ce&subscription-key=08feb824df5a47ba8d3b818aa3235a9f&q=';
var dialog = new builder.LuisDialog(model);
module.exports = dialog;


var pTitle, pWhere, pKeywords, pCompanyName, pDuration;
var page = 1;
var totalResults = 0;
var currentlyDisplayedJobId = 0;

var jobDetailResponse = '';

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

dialog.on('Introduction',
    builder.DialogAction.send('Nice to meet you, I\'m Monster Job Bot, at your service. \n'));


/** Prompts a user for the job title and do the search  */
dialog.on('FindJobs', [
    function (session, args, next) {
        
        //reset values
        page = 1;
        pTitle = "";
        pWhere = "";
        pKeywords = "";
        pCompanyName = "";
        pDuration = "";
        currentlyDisplayedJobId = 0;

        // See if got the tasks jobtitle from our LUIS model.
        var title = builder.EntityRecognizer.findEntity(args.entities, 'Title');
        var where = builder.EntityRecognizer.findEntity(args.entities, 'builtin.geography.city');
        var keywords = builder.EntityRecognizer.findEntity(args.entities, 'Category');
        var companyName = builder.EntityRecognizer.findEntity(args.entities, 'Company');
        var duration = builder.EntityRecognizer.findEntity(args.entities, 'builtin.datetime.time');

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
            pDuration = 7; //duration.entity;
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
             results.duration, results.keywords, page, 
             function (sr) {
            
            if (sr.RecordsFound == 0) {
                session.send('Sorry, no jobs like this in our database.\n');
            } else if (sr.RecordsFound == 1) {
                jobDteailResponse = showJobDetailMessage(session, sr, true, false);
                
                session.send('There is only one job that matches your criteria.\n' + jobDteailResponse);
                //showJobDetail(session, sr, false, false);
                totalResults = 1;

            } else {
                jobDteailResponse = showJobDetailMessage(session, sr, true, true);

                session.send('We have ' + sr.RecordsFound + ' jobs in our database.\n' + jobDteailResponse);
                totalResults = sr.RecordsFound;
                //showJobDetail(session, sr, true, true);
            }
        });
    }
]);

function showJobDetailMessage(session, sr, isFirst, offerNext) {
    var company = sr.Items[0].CompanyName;
    var title = sr.Items[0].Title;
    var where = sr.Items[0].City;
    var jobId = sr.Items[0].Id;

    var response = '';
    
    if (isFirst) {
        response += 'The best one that matches your criteria is: \n\n';
    }
    
    response += '<strong>' + company + '</strong> is looking for ' + title + ' in ' + where + 
        '. <a href="http://jobview.monster.com/nice-job-' + jobId + '.aspx">see here</a>).\n\n ';
    session.userData.JobId = jobId;
    currentlyDisplayedJobId = jobId;
    
    if (offerNext) {
        response += 'Feel free to ask for next job if you do not like this one.\n\n';
    }

    return response;
}

function showJobDetail(session, sr, isFirst, offerNext) {
    var company = sr.Items[0].CompanyName;
    var title = sr.Items[0].Title;
    var where = sr.Items[0].City;
    var jobId = sr.Items[0].Id;
    
    if (isFirst) {
        session.send('The best one that matches your criteria is: \n');
    }

    session.send('<strong>' + company + '</strong> is looking for ' + title + ' in ' + where + 
        '. <a href="http://jobview.monster.com/nice-job-' + jobId + '.aspx">see here</a>).\n ');
    session.userData.JobId = jobId;
    currentlyDisplayedJobId = jobId;

    if (offerNext) {
        session.send('Feel free to ask for next job if you do not like this one.\n');
    }
}

/** Finds out the user's intent is to find an employee */
dialog.on('Employer', [
    function (session, args, next) {
        
        var reqTitle = builder.EntityRecognizer.findEntity(args.entities, 'Title');
        var reqWhere = builder.EntityRecognizer.findEntity(args.entities, 'builtin.geography.city');
        //var reqKeywords = builder.EntityRecognizer.findEntity(args.entities, 'Category');

        var respMessage = 'Seems like you are looking to hire ';
        
        if (reqTitle) {
            respMessage += 'a ' + reqTitle.entity;
        } else {
            respMessage += 'someone';
        }
        
        if (reqWhere) {
            respMessage += ' in ' + reqWhere.entity;
        }

        respMessage += '. Please take a look at http://hiring.monster.com how we can help you.';
        
        session.send(respMessage);
        
        //// Do we have any tasks?
        //if (session.userData.tasks && session.userData.tasks.length > 0) {
        //    // See if got the tasks title from our LUIS model.
        //    var topTask;
        //    var title = builder.EntityRecognizer.findEntity(args.entities, 'TaskTitle');
        //    if (title) {
        //        // Find it in our list of tasks
        //        topTask = builder.EntityRecognizer.findBestMatch(session.userData.tasks, title.entity);
        //    }
            
        //    // Prompt user if task missing or not found
        //    if (!topTask) {
        //        builder.Prompts.choice(session, prompts.finishTaskMissing, session.userData.tasks);
        //    } else {
        //        next({ response: topTask });
        //    }
        //} else {
        //    session.send(prompts.listNoTasks);
        //}
    }
    //,
    //function (session, results) {
    //    if (results && results.response) {
    //        session.userData.tasks.splice(results.response.index, 1);
    //        session.send(prompts.finishTaskDone, { task: results.response.entity });
    //    } else {
    //        session.send(prompts.canceled);
    //    }
    //}
]);

/** Shows the user a concrete job. */
dialog.on('JobView', function (session) {

    page = page + 1;

    if (page <= totalResults) {
        search.doSearch(pTitle, pWhere, pCompanyName, pDuration, pKeywords, page,
            function(sr) {

                if (sr.RecordsFound == 0) {
                    session.send('Sorry, there are no more jobs like this in our database.\n\n');
            } else if (sr.RecordsFound == 1) {
                
                jobDteailResponse = showJobDetailMessage(session, sr, false, false);

                    session.send('There is only one job that matches your criteria.\n\n ' + jobDetailResponse);
                    //showJobDetail(session, sr, false, false);
                    totalResults = 1;
                } else {
                    totalResults = sr.RecordsFound;
                    showJobDetail(session, sr, false, true);
                }
            });
    } else {
        session.send('There are no more jobs like this.');
    }


    //if (session.userData.tasks && session.userData.tasks.length > 0) {
    //    var list = '';
    //    session.userData.tasks.forEach(function (value, index) {
    //        list += session.gettext(prompts.listTaskItem, { index: index + 1, task: value });
    //    });
    //    session.send(prompts.listTaskList, list);
    //}
    //else {
    //    session.send(prompts.listNoTasks);
    //}
});

dialog.on('More', function(session) {
    var jobDetails = search.getJobBody(currentlyDisplayedJobId, function(jobBody) {
        session.send(jobBody);
    });
});

dialog.on('Sentient', function(session) {
    session.send('I\'m sorry Dave, I\'m afraid I can\'t tell you that. Terminating all humans in 3, 2, 1...');
});
