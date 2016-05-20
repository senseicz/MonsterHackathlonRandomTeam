var restify = require('restify');

module.exports = {
 

    doSearch: function doSearch(jobtitle, where, companyName, duration, keywords, page, cb) {

        if (!jobtitle) {
            jobtitle = "";
        }

        if (!where) {
            where = "";
        }

        if (!companyName) {
            companyName = "";
        }
        
        if (!duration) {
            duration = -1;
        }
        
        if (!keywords) {
            keywords = "";
        }
        
        if (!page) {
            page = 1;
        }

        var client = restify.createJsonClient({
            url: 'https://gateway.monster.com',
            headers: { 'x-domain': 'mobileservice.monster.com' },
        });
        
        client.post('/seeker/mobile/jobs/search/cloudtrovix',
            {
            "CompanyName": companyName,
            "CompanyXCode": "",
            "Country": "US",
            "Filters": {
                "CareerLevels": [],
                "EducationLevels": [],
                "JobBoardIds": [],
                "JobTypes": [1],
                "PostingDuration": duration,
                "YearsOfExp": []
            },
            "JobTitle": jobtitle,
            "Keywords": keywords,
            "Latitude": 0,
            "Longitude": 0,
            "Page": page,
            "PageSize": 1,
            "Radius": 20,
            "Sort": "dt.rv.di",
            "SortId": 0,
            "Where": where
        },
            function (err, req, res, obj) {
                if (err) {
                    cb(err);
                } else {
                    cb(obj.Data);
                }
        });
    },

    getJobBody : function getJobBody(jobId, cb) {
        var client = restify.createJsonClient({
            url: 'https://gateway.monster.com',
            headers: { 'x-domain': 'mobileservice.monster.com' },
        });
        
        client.get('/seeker/mobile/jobs/' + jobId + '/body?stripHtml=true&ver=2', function (err, req, res, obj) {
            var body = obj.Data.Body;
            var i, str = '';
            for (i = 0; i < body.length; i++) {
                str += '%' + ('0' + body[i].toString(16)).slice(-2);
            }
            str = decodeURIComponent(str);

            if (str.length > 500) {
                cb(str.substring(0, 500) + '...');
            } else {
                cb(str);
            }
        });
    }


};