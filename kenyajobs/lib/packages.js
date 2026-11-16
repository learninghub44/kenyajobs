export const PACKAGES = {
  jobs: [
    { code:"job_basic", name:"Standard", price:2500, durationDays:14, listingLimit:1, features:["One job vacancy","Standard search placement","Full job description and application link","Employer contact details","14-day publication period","Admin review before publishing"], limits:{title:180,description:12000,images:1,featuredDays:0,promotions:0} },
    { code:"job_featured", name:"Featured", price:5000, durationDays:30, listingLimit:1, features:["One job vacancy","Featured badge and priority placement","Up to 30 days online","One scheduled social-channel promotion subject to editorial approval","Full employer and application details","Admin review and expiry tracking"], limits:{title:180,description:12000,images:1,featuredDays:14,promotions:1} },
    { code:"job_premium", name:"Premium Reach", price:10000, durationDays:30, listingLimit:1, features:["One premium job vacancy","Top placement in featured jobs","Featured placement for 30 days","Up to two scheduled promotional announcements, subject to channel availability and approval","Company logo and website display","Priority admin review and performance check"], limits:{title:180,description:12000,images:2,featuredDays:30,promotions:2} },
    { code:"job_bundle5", name:"Recruiter Bundle", price:20000, durationDays:60, listingLimit:5, features:["Up to five separate vacancies","Up to 60 days per approved listing","Priority placement for each listing","Company profile and logo","Up to five promotional announcement requests","One admin contact for the campaign"], limits:{title:180,description:12000,images:5,featuredDays:14,promotions:5} }
  ],
  events: [
    { code:"event_basic", name:"Event Listing", price:1500, durationDays:7, listingLimit:1, features:["One event listing","Event date, time, venue and organiser details","One poster or cover image","Ticket or registration link","7-day promotional listing window (event date must be supplied)","Admin review before publishing"], limits:{title:160,description:5000,images:1,featuredDays:0,promotions:0} },
    { code:"event_featured", name:"Featured Event", price:3500, durationDays:14, listingLimit:1, features:["One event listing","Featured badge and priority event placement","One poster or cover image","Ticket or registration link","One scheduled channel promotion request, subject to approval","14-day promotion window"], limits:{title:160,description:8000,images:2,featuredDays:7,promotions:1} },
    { code:"event_premium", name:"Event Spotlight", price:6500, durationDays:30, listingLimit:1, features:["One premium event listing","Homepage event spotlight placement","Featured placement for up to 14 days","Up to two scheduled reminder-promotion requests, subject to approval","Up to three event images","Ticketing, venue and organiser links","Priority admin coordination"], limits:{title:160,description:10000,images:3,featuredDays:14,promotions:2} }
  ]
};
export function getPackage(type, code) {
  return (PACKAGES[type] || []).find((item) => item.code === code) || null;
}
export function packagePublicData(type) {
  return (PACKAGES[type] || []).map(({code,name,price,durationDays,listingLimit,features,limits}) => ({code,name,price,durationDays,listingLimit,features,limits}));
}
