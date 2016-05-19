var restify = require('restify');

module.exports = {
 

    getNumberOfJobs: function getNumberOfJobs(jobtitle, where, companyName, duration, keywords) {
        this.doSearch(jobtitle, where, companyName, duration, keywords, function(sr) {
            if (sr) {
                return sr.RecordsFound;
            }
            
            return 0;
        });
        
    },


    doSearch: function doSearch(jobtitle, where, companyName, duration, keywords, cb) {

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
            "Page": 1,
            "PageSize": 5,
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
    }
};