jQuery.sap.declare("incture.com.MaterialEnquiry.model.formatter");incture.com.MaterialEnquiry.model.formatter={f4ValueBind:function(e,r){if(e&&r){return e+" ("+r+")"}else if(e&&!r){return e}else if(!e&&r){return r}else{return""}},getLength:function(e){if(e)return" ("+e.length+")";return""}};