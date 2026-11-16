export const PACKAGES = {
  jobs: [
    { code:"job_basic", name:"Standard", price:2500, durationDays:14, listingLimit:1, features:["One job vacancy","Standard search placement","Full job description and application link","Employer contact details","14-day publication period","Admin review before publishing"], limits:{title:180,description:12000,images:1,featuredDays:0,promotions:0} },
    { code:"job_featured", name:"Featured", price:5000, durationDays:30, listingLimit:1, features:["One job vacancy","Featured badge and priority placement","Up to 30 days online","Full employer and application details","Admin review and expiry tracking"], limits:{title:180,description:12000,images:1,featuredDays:14,promotions:0} },
    { code:"job_premium", name:"Premium Reach", price:10000, durationDays:30, listingLimit:1, features:["One premium job vacancy","Top placement in featured jobs","Featured placement for 30 days","Company logo and website display","Priority admin review and performance check"], limits:{title:180,description:12000,images:1,featuredDays:30,promotions:0} },
    { code:"job_bundle5", name:"Recruiter Campaign", price:20000, durationDays:60, listingLimit:1, features:["One job vacancy campaign","Up to 60 days online","Priority placement during the campaign","Company logo and website display","One admin contact for the campaign"], limits:{title:180,description:12000,images:1,featuredDays:14,promotions:0} }
  ],
  events: Array.from({length:10},(_,i)=>{const count=i+1;return {code:"event_bundle_"+count,name:count===1?"Single event":count+"-event bundle",price:1500+(count-1)*2000,durationDays:7,listingLimit:count,features:[count===1?"One event listing":count+" separate event listings","One banner image per event","Event date, venue, organiser and registration details","7-day promotion period per event","Admin review and payment confirmation before publishing"],limits:{title:160,description:5000,images:1,featuredDays:0,promotions:0}};})
};
const LEGACY_EVENT_PACKAGES = {
  event_basic:{code:"event_basic",name:"Event Listing",price:1500,durationDays:7,listingLimit:1,features:["Legacy single event listing"],limits:{title:160,description:5000,images:1,featuredDays:0,promotions:0}},
  event_featured:{code:"event_featured",name:"Featured Event",price:3500,durationDays:14,listingLimit:1,features:["Legacy featured event listing"],limits:{title:160,description:8000,images:1,featuredDays:7,promotions:0}},
  event_premium:{code:"event_premium",name:"Event Spotlight",price:6500,durationDays:30,listingLimit:1,features:["Legacy premium event listing"],limits:{title:160,description:10000,images:1,featuredDays:14,promotions:0}}
};
export function getPackage(type, code) {
  return (PACKAGES[type] || []).find((item) => item.code === code) || (type==="events" ? LEGACY_EVENT_PACKAGES[code] || null : null);
}
export function packagePublicData(type) {
  return (PACKAGES[type] || []).map(({code,name,price,durationDays,listingLimit,features,limits}) => ({code,name,price,durationDays,listingLimit,features,limits}));
}
