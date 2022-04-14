jQuery.sap.declare("incture.com.MaterialEnquiry.model.formatter");

incture.com.MaterialEnquiry.model.formatter = {
	f4ValueBind: function (val1, val2) {
		if (val1 && val2) {
			return val1 + " (" + val2 + ")";
		} else if (val1 && !val2) {
			return val1;
		} else if (!val1 && val2) {
			return val2;
		} else {
			return "";
		}
	},
	getLength: function (value) {
		if (value)
			return " (" + value.length + ")";
		return "";
	}
};