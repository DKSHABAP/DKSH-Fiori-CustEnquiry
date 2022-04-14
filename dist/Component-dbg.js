	(function (w, d, s, l, i) {
		w[l] = w[l] || [];
		w[l].push({
			'gtm.start': new Date().getTime(),
			event: 'gtm.js'
		});
		var f = d.getElementsByTagName(s)[0],
			j = d.createElement(s),
			dl = l != 'dataLayer' ? '&l=' + l : '';
		j.async = true;
		j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
		f.parentNode.insertBefore(j, f);
		
		// GTM-WG969CM
	})(window, document, 'script', 'dataLayer', 'UA-179725869-1', 'ga');
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"incture/com/ConnectClientCustomeEnquiry/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("incture.com.ConnectClientCustomeEnquiry.Component", {

		metadata: {
			manifest: "json",
			config: {
				fullWidth: true
			}
		},
		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});