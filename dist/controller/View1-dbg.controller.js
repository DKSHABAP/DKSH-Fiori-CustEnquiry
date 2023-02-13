sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV',
	"sap/m/Token",
	"../model/formatter",
	"sap/ui/export/Spreadsheet",
	"sap/m/MessageToast",
	'sap/ui/core/Fragment'
], function (Controller, JSONModel, Export, ExportTypeCSV, Token, formatter, Spreadsheet, MessageToast, Fragment) {
	"use strict"; 
	return Controller.extend("incture.com.ConnectClientCustomeEnquiry.controller.View1", {
		onInit: function () {
			var oModel = new JSONModel();
			this.getView().setModel(oModel, "oModel");
			var baseModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(baseModel, "baseModel");
			this.getView().getModel("baseModel").setProperty("/openVisiblity", false);
			this.getView().getModel("baseModel").setProperty("/CollapseVisiblity", true);
			this.getView().getModel("baseModel").setProperty("/SearchVisiblity", true);
			var that = this;
			this.allAccess = true;
			this.getLoggedInUserDetail();
			this.salesOrgFromSelectedItems = [];
			this.SoldToPartyModel = new sap.ui.model.json.JSONModel({
				CustId: "",
				CustIdDesc: "",
				CustName: "",
				CustNameDesc: "",
				Division: "",
				DivisionDesc: "",
				// FsleSalesOrg: "",
				SalesOrgDesc: "",
				DistChan: "",
				DistChanDesc: "",
				SalesOrg: ""
			});
			this.getView().setModel(this.SoldToPartyModel, "SoldToPartyModSet");
			this.salesHdrData = {
				Category: "",
				customerPo: "",
				SoldtoParty: "",
				SoldtoPartyDesc: "",
				SalesDocNumInitial: "",
				SalesDocNumEnd: "",
				MatGrp4: "",
				SalesDocDateFrom: null,
				SalesDocDateTo: null,
				DistChan: "",
				DistChanDesc: "",
				MatGrp: "",
				salesOrg: "",
				division: "",
				CustomerNo: "",
				itemDeliveryBlock: "",
				shipToParty: "",
				headerDlvBlock: "",
				sapMaterialNum: ""
			};
			this.SalesHdrModel = new sap.ui.model.json.JSONModel(this.salesHdrData);
			this.getView().setModel(this.SalesHdrModel, "SaleHdrModelSet");
		},
		getLoggedInUserDetail: function () {
			var userId;
			var thes = this;
			$.ajax({
				type: "GET",
				async: false,
				url: "/services/userapi/currentUser",
				contentType: "application/scim+json",
				success: function (data, textStatus, xhr) {

					var userModel = new sap.ui.model.json.JSONModel(data);
					thes.getView().setModel(userModel, "userapi");
					userId = thes.getView().getModel("userapi").getData().name;
					thes.userID = userId;
					// thes.getLoggedInUserName(userId);
					thes.getAttributeDetails(userId);
				},
				error: function (data) {
					sap.m.MessageBox.error(thes.getView().getModel("i18n").getProperty("retrieveDetails"));
				},
				complete: function (data) {}
			});
			return userId;
		},
		getAttributeDetails: function (userId) {
			var that = this;
			$.ajax({
				type: "GET",
				async: false,
				url: "/DKSHJavaService/userDetails/findAllRightsForUserInDomain/" + userId + "&cc",
				contentType: "application/scim+json",
				success: function (data, textStatus, xhr) {
					if (data.message)
						that.allAccess = false;
					that.salesOrgDataAccess = data.ATR01;
					that.distrChannelDataAccess = data.ATR02;
					that.divisionDataAccess = data.ATR03;
					that.materialGroupDataAccess = data.ATR04;
					that.materialGroup4DataAccess = data.ATR05;
					that.custCodeDataAccess = data.ATR06;
				},
				error: function (data) {
					that.salesOrgDataAccess = null;
					that.distrChannelDataAccess = null;
					that.divisionDataAccess = null;
					that.materialGroupDataAccess = null;
					that.materialGroup4DataAccess = null;
					that.custCodeDataAccess = null;
					if (data.status == 409)
						that.allAccess = false;
					else
						sap.m.MessageBox.error("Could not retrieve logged in user details");
				},
				complete: function (data) {}
			});
		},
		/*function to call scim service to get the user details*/ 
		getLoggedInUserName: function (userId) {
			var that = this;
			var oLoggedInUserDetailModel = new sap.ui.model.json.JSONModel();
			that.getView().setModel(oLoggedInUserDetailModel, "oLoggedInUserDetailModel");
			// Service to getLogged in User
			oLoggedInUserDetailModel.loadData("/IDPService/service/scim/Users/" + userId, null, true);
			oLoggedInUserDetailModel.attachRequestCompleted(function (oEvent) {
				// data access control
				var custAttribute = oEvent.getSource().getData()["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"];
				if (custAttribute == undefined) {} else {
					if (custAttribute.attributes[0] !== undefined) {
						that.salesOrgDataAccess = custAttribute.attributes[0].value;
					} else {
						that.salesOrgDataAccess = "No Access";
					}
					if (custAttribute.attributes[2] !== undefined) {
						that.distrChannelDataAccess = custAttribute.attributes[2].value;
					} else {
						that.distrChannelDataAccess = "No Access";

					}
					if (custAttribute.attributes[3] !== undefined) {
						that.divisionDataAccess = custAttribute.attributes[3].value;
					} else {
						that.divisionDataAccess = "No Access";

					}
					if (custAttribute.attributes[4] !== undefined) {
						that.materialGroupDataAccess = custAttribute.attributes[4].value;
					} else {
						that.materialGroupDataAccess = "No Access";

					}
					if (custAttribute.attributes[5] !== undefined) {
						that.materialGroup4DataAccess = custAttribute.attributes[5].value;
					} else {
						that.materialGroup4DataAccess = "No Access";

					}
					if (custAttribute.attributes[6] !== undefined) {
						that.custCodeDataAccess = custAttribute.attributes[6].value;
					} else {
						that.custCodeDataAccess = "No Access";

					}
				}
				var loggedInuserId = oEvent.getSource().getData().id; // to get pid
				that.getView().getModel("oLoggedInUserDetailModel").setProperty("/userLoginId", loggedInuserId);
				var userName = oEvent.getSource().getData().name; // to get name 
				that.getView().getModel("oLoggedInUserDetailModel").setProperty("/loggedInUser", userName.givenName + " " + userName.familyName);
				var emailId = oEvent.getSource().getData().emails["0"].value;
				that.getView().getModel("oLoggedInUserDetailModel").setProperty("/loggedInUserMail", emailId); // to get email id
				//	that.launchpadTilesFunction(); //method to specify content base on type of tile
				//	that.loadCustomTemplates(); //method to generate filter parameter controls
			});
			oLoggedInUserDetailModel.attachRequestFailed(function (oEvent) {
				// MessageBox.error(oEvent.getSource().getData().message);
			});
		},
		onSearchSoldToParty: function (oEvent) {
			var that = this,
				SoldToPartyList = new sap.ui.model.json.JSONModel({
					"results": []
				}),
				aPayload = this.getView().getModel("SoldToPartyModSet").getData(),
				afilters = [];
			that.CustCodeFrag.setModel(SoldToPartyList, "SoldToPartyListSet");
			sap.ui.getCore().byId("idFrgCustID").setValueState(sap.ui.core.ValueState.None);
			if (aPayload.CustId === "" && aPayload.CustIdDesc === "" && aPayload.CustName === "" && aPayload.CustNameDesc === "" && aPayload.Division ===
				"" &&
				aPayload.DivisionDesc === "" && aPayload.SalesOrgDesc === "" && aPayload.DistChan === "" &&
				aPayload.DistChanDesc === "" && aPayload.SalesOrg ===
				"") {
				sap.m.MessageBox.error(this.getView().getModel("i18n").getProperty("enterAtleastOne"));
				return;
			}
			if (aPayload.CustId !== "") {
				afilters.push(new sap.ui.model.Filter("CustCode", sap.ui.model.FilterOperator.EQ, aPayload.CustId));
			}

			if (aPayload.CustNameDesc !== "") {
				afilters.push(new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.EQ, aPayload.CustNameDesc));
			}
			if (aPayload.DistChan !== "") {
				afilters.push(new sap.ui.model.Filter("Distchl", sap.ui.model.FilterOperator.EQ, aPayload.DistChan));
			} else {
				afilters.push(new sap.ui.model.Filter("Distchl", sap.ui.model.FilterOperator.EQ, that.distrChannelDataAccess));
			}
			if (aPayload.Division !== "") {
				afilters.push(new sap.ui.model.Filter("Division", sap.ui.model.FilterOperator.EQ, aPayload.Division));
			} else {
				afilters.push(new sap.ui.model.Filter("Division", sap.ui.model.FilterOperator.EQ, that.divisionDataAccess));
			}
			if (aPayload.SalesOrg !== "") {
				afilters.push(new sap.ui.model.Filter("SalesOrg", sap.ui.model.FilterOperator.EQ, aPayload.SalesOrg));
			} else {
				afilters.push(new sap.ui.model.Filter("SalesOrg", sap.ui.model.FilterOperator.EQ, that.salesOrgDataAccess));
			}

			var oDataModel = this.getView().getModel("ZDKSH_CC_DAC_SOLDTOPARTY_SRV");
			var busyDialog = new sap.m.BusyDialog();
			busyDialog.open();
			oDataModel.read("/ZSoldToPartySH", {
				async: false,
				filters: afilters,
				success: function (oData, oResponse) {
					busyDialog.close();
					that.CustCodeFrag.getModel("SoldToPartyListSet").setData({
						"results": oData.results
					});
				},
				error: function (error) {
					busyDialog.close();
					var errorMsg = "";
					if (error.statusCode === 504) {
						errorMsg = that.getView().getModel("i18n").getProperty("timeout");
						sap.m.MessageToast.error(errorMsg);
					} else {
						errorMsg = JSON.parse(error.responseText);
						errorMsg = errorMsg.error.message.value;
						sap.m.MessageToast.error(errorMsg);
					}
				}
			});

		},

		onSubmitSoldtoParty: function (oEvent) {
			var oTable = sap.ui.getCore().byId("idSoldtoPartyTable");
			if (oTable.getItems().length > 0 && oTable.getSelectedContextPaths().length > 0) {
				var oBinding = oTable.getSelectedItem().getBindingContext("SoldToPartyListSet");
				var soldToPartyData = this.getView().getModel("SaleHdrModelSet").getData();
				soldToPartyData.SoldtoParty = oBinding.getProperty("CustCode");
				soldToPartyData.SoldtoPartyDesc = oBinding.getProperty("Name1");
				soldToPartyData.DistChan = oBinding.getProperty("Distchl");
				soldToPartyData.DistChanDesc = oBinding.getProperty("DCName");
				soldToPartyData.salesOrg = oBinding.getProperty("SalesOrg");
				soldToPartyData.SalesOrgDesc = oBinding.getProperty("SOrgName");
				soldToPartyData.division = oBinding.getProperty("Division");
				soldToPartyData.DivisionDesc = oBinding.getProperty("DName");
				this.getView().getModel("SaleHdrModelSet").refresh();
				this.onResetSoldToParty();
				this.getView().getModel("oModel").setProperty("/custCode", soldToPartyData.SoldtoParty);
				this.CustCodeFrag.close();
			} else {
				sap.m.MessageBox.error(this.getView().getModel("i18n").getProperty("selectAtleastOne"));
			}
		},
		valueHelpRequestCustCode: function (oEvent) {
			var that = this;
			if (!that.custCodeDataAccess) {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("DataAccessControl"));
			} else {
				if (!that.CustCodeFrag) {
					that.CustCodeFrag = sap.ui.xmlfragment("incture.com.ConnectClientCustomeEnquiry.view.Fragments.soldTo", this);
					that.getView().addDependent(that.CustCodeFrag);
					that.CustCodeFrag.addStyleClass("sapUiSizeCompact");
				}
				sap.ui.getCore().byId("idFrgCustID").setValueState(sap.ui.core.ValueState.None);
				sap.ui.getCore().byId("idSearchSoldToParty").setValue("");
				that.CustCodeFrag.open();
			}

		},
		valueHelpRequestDistChan: function (oEvent) {
			var that = this;
			this.distChnlInputId = oEvent.getSource().getId();
			if (!that.distrChannelDataAccess) {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("DataAccessControl"));
			} else {

				if (!that.DistChanFrag) {
					that.DistChanFrag = sap.ui.xmlfragment("incture.com.ConnectClientCustomeEnquiry.view.Fragments.DistChan", that);
					that.getView().addDependent(that.DistChanFrag);

					var oDataModel = this.getView().getModel("ODataNewService");
					var filters = [];
					var lang = "";
					if (sap.ushell && sap.ushell.Container) {
						lang = sap.ui.getCore().getConfiguration().getLanguage();
					} else {
						lang = "EN";
					}
					lang = lang.toUpperCase();
					var oFilter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("Language", sap.ui.model.FilterOperator.EQ, lang),
							new sap.ui.model.Filter("DistChl", sap.ui.model.FilterOperator.EQ, that.distrChannelDataAccess)
						],
						and: true
					});
					filters.push(oFilter);
					var busyDialog = new sap.m.BusyDialog();
					busyDialog.open();
					oDataModel.read("/ZDISTCHLLOOKUPSet", {
						async: false,
						filters: filters,
						success: function (oData, oResponse) {
							busyDialog.close();
							var DistChanModel = new sap.ui.model.json.JSONModel({
								"results": oData.results
							});
							that.DistChanFrag.setModel(DistChanModel, "DistChanSet");
							that.DistChanFrag.open();
						},
						error: function (error) {
							busyDialog.close();
							var errorMsg = "";
							if (error.statusCode === 504) {
								errorMsg = that.getView().getModel("i18n").getProperty("timeout");
								sap.m.MessageToast.error(errorMsg);
							} else {
								errorMsg = JSON.parse(error.responseText);
								errorMsg = errorMsg.error.message.value;
								sap.m.MessageToast.error(errorMsg);
							}
						}
					});
				} else {
					that.DistChanFrag.open();
				}
			}
		},
		handleAddDistChan: function (oEvent) {
			var selectedObj = oEvent.getParameters().selectedContexts[0].getObject();
			if (this.distChnlInputId === "idDistChanCC") {
				var hdrModel = this.getView().getModel("SoldToPartyModSet");
				hdrModel.getData().DistChan = selectedObj.DistChl;
				hdrModel.getData().DistChanDesc = selectedObj.Name;
				hdrModel.refresh();
			} else {
				var salesFilterModel = this.getView().getModel("SaleHdrModelSet");
				salesFilterModel.getData().DistChan = selectedObj.DistChl;
				salesFilterModel.getData().DistChanDesc = selectedObj.Name;
				salesFilterModel.refresh();
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		onLiveChangestorageLoc: function (oEvent) {
			var value = oEvent.getParameters().value;
			var filters = [];
			var oFilter = new sap.ui.model.Filter([new sap.ui.model.Filter("Lgort", sap.ui.model.FilterOperator.Contains, value)]);
			filters.push(oFilter);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(filters);
		},
		//	on cancel DistChan f4
		handleCancelDistChan: function (oEvent) {
			oEvent.getSource().getBinding("items").filter([]);
			// this.onResetSoldToParty();
		},

		valueHelpRequestSalesOrg: function (oEvent) {
			this.salesOrgInputId = oEvent.getSource().getId();
			var that = this;
			if (!that.salesOrgDataAccess) {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("DataAccessControl"));
			} else {

				if (!that.SalesOrgFrag1) {
					that.SalesOrgFrag1 = sap.ui.xmlfragment("incture.com.ConnectClientCustomeEnquiry.view.Fragments.SalesOrgSingle", that);
					that.getView().addDependent(that.SalesOrgFrag1);
					var oDataModel = this.getView().getModel("ODataNewService");
					var lang = "";
					if (sap.ushell && sap.ushell.Container) {
						lang = sap.ui.getCore().getConfiguration().getLanguage();
					} else {
						lang = "EN";
					}
					lang = lang.toUpperCase();
					var filters = [];
					var oFilter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("Language", sap.ui.model.FilterOperator.EQ, lang),
							new sap.ui.model.Filter("SalesOrg", sap.ui.model.FilterOperator.EQ, that.salesOrgDataAccess)
						],
						and: true
					});
					filters.push(oFilter);
					var busyDialog = new sap.m.BusyDialog();
					busyDialog.open();
					oDataModel.read("/ZSALESORGLOOKUPSet", {
						async: true,
						filters: filters,
						success: function (oData, oResponse) {
							busyDialog.close();
							var SalesOrgModel1 = new sap.ui.model.json.JSONModel({
								"results": oData.results
							});
							that.SalesOrgFrag1.setModel(SalesOrgModel1, "SalesOrgSet1");
							that.SalesOrgFrag1.open();
						},
						error: function (error) {
							busyDialog.close();
							var errorMsg = "";
							if (error.statusCode === 504) {
								errorMsg = that.getView().getModel("i18n").getProperty("timeout");
								sap.m.MessageToast.error(errorMsg);
							} else {
								errorMsg = JSON.parse(error.responseText);
								errorMsg = errorMsg.error.message.value;
								sap.m.MessageToast.error(errorMsg);
							}
						}
					});
				} else {
					that.SalesOrgFrag1.open();
				}
			}
		},
		handleAddSalesOrg: function (oEvent) {
			var selectedObj = oEvent.getParameters().selectedContexts[0].getObject();
			if (this.salesOrgInputId === "idFrgQty") {
				var hdrModel = this.getView().getModel("SoldToPartyModSet");
				hdrModel.getData().SalesOrg = selectedObj.SalesOrg;
				hdrModel.getData().SalesOrgDesc = selectedObj.Name;
				hdrModel.refresh();
			} else {
				var salesFilterModel = this.getView().getModel("SaleHdrModelSet");
				salesFilterModel.getData().salesOrg = selectedObj.SalesOrg;
				salesFilterModel.getData().SalesOrgDesc = selectedObj.Name;
				salesFilterModel.refresh();
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		//	on cancel SalesOrg
		handleCancelSalesOrg: function (oEvent) {
			oEvent.getSource().getBinding("items").filter([]);
			// this.onResetSoldToParty();
		},
		//live search SalesOrg
		onLiveChangeSalesOrg: function (oEvent) {
			var value = oEvent.getParameters().value;
			var filters = new Array();
			var oFilter = new sap.ui.model.Filter([new sap.ui.model.Filter("SalesOrg", sap.ui.model.FilterOperator.Contains, value),
				new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, value)
			]);
			filters.push(oFilter);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(filters);
		},
		fnLiveChangeSalesOrg: function (oEvent) {
			var value = oEvent.getParameters().value;
			var filters = new Array();
			var oFilter = new sap.ui.model.Filter([new sap.ui.model.Filter("Salesorg", sap.ui.model.FilterOperator.Contains, value),
				new sap.ui.model.Filter("SalesorgDesc", sap.ui.model.FilterOperator.Contains, value)
			]);
			filters.push(oFilter);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(filters);
		},

		valueHelpRequestDivision: function (oEvent) {
			this.divisionInputId = oEvent.getSource().getId();
			var that = this;
			if (!that.divisionDataAccess) {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("DataAccessControl"));
			} else {

				if (!that.DivisionFrag) {
					that.DivisionFrag = sap.ui.xmlfragment("incture.com.ConnectClientCustomeEnquiry.view.Fragments.Division", that);
					that.getView().addDependent(that.DivisionFrag);
					var oDataModel = this.getView().getModel("ODataNewService");
					var filters = [];
					var lang = "";
					if (sap.ushell && sap.ushell.Container) {
						lang = sap.ui.getCore().getConfiguration().getLanguage();
					} else {
						lang = "EN";
					}
					lang = lang.toUpperCase();
					var oFilter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("Language", sap.ui.model.FilterOperator.EQ, lang),
							new sap.ui.model.Filter("Division", sap.ui.model.FilterOperator.EQ, that.divisionDataAccess)
						],
						and: true
					});
					filters.push(oFilter);
					var busyDialog = new sap.m.BusyDialog();
					busyDialog.open();
					oDataModel.read("/ZDIVISIONLOOKUPSet", {
						async: false,
						filters: filters,
						success: function (oData, oResponse) {
							busyDialog.close();
							var DivisionModel = new sap.ui.model.json.JSONModel({
								"results": oData.results
							});
							that.DivisionFrag.setModel(DivisionModel, "DivisionSet");
							that.DivisionFrag.open();
						},
						error: function (error) {
							busyDialog.close();
							var errorMsg = "";
							if (error.statusCode === 504) {
								errorMsg = that.getView().getModel("i18n").getProperty("timeout");
								sap.m.MessageToast.error(errorMsg);
							} else {
								errorMsg = JSON.parse(error.responseText);
								errorMsg = errorMsg.error.message.value;
								sap.m.MessageToast.error(errorMsg);
							}
						}
					});
				} else {
					that.DivisionFrag.open();
				}
			}
		},
		//	on confirm Division
		handleAddDivision: function (oEvent) {
			var selectedObj = oEvent.getParameters().selectedContexts[0].getObject();
			if (this.divisionInputId === "idFrgPrice") {
				var hdrModel = this.getView().getModel("SoldToPartyModSet");
				hdrModel.getData().Division = selectedObj.Division;
				hdrModel.getData().DivisionDesc = selectedObj.Name;
				hdrModel.refresh();
			} else {
				var salesFilterModel = this.getView().getModel("SaleHdrModelSet");
				salesFilterModel.getData().division = selectedObj.Division;
				salesFilterModel.getData().DivisionDesc = selectedObj.Name;
				salesFilterModel.refresh();
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		//	on cancel Division
		handleCancelDivision: function (oEvent) {
			oEvent.getSource().getBinding("items").filter([]);
			// this.onResetSoldToParty();
		},
		//live search Division
		onLiveChangeDivision: function (oEvent) {
			var value = oEvent.getParameters().value;
			var filters = new Array();
			var oFilter = new sap.ui.model.Filter([new sap.ui.model.Filter("Division", sap.ui.model.FilterOperator.Contains, value),
				new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, value)
			]);
			filters.push(oFilter);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(filters);
		},

		salesOrgValueHelp: function (oEvent) {
			this.salesOrgPlaceholder = oEvent.getSource().getPlaceholder();
			var that = this;
			if (!that.salesOrgDataAccess) {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("DataAccessControl"));
			} else {
				// var that = this;
				if (!that.salesOrg) {
					that.salesOrg = sap.ui.xmlfragment("incture.com.ConnectClientCustomeEnquiry.view.Fragments.SalesOrg", that);
					that.getView().addDependent(that.salesOrg);
					var oDataModel = this.getView().getModel("ZDKSH_CC_INVENTORY_HDRLOOKUP_SRV");
					var filters = [];
					var lang = "";
					if (sap.ushell) {
						if (sap.ui.getCore().getConfiguration().getLanguage() === "th") {
							lang = "2";
						} else {
							lang = "EN";
						}
					} else {
						lang = "EN";
					}
					lang = lang.toUpperCase();
					var oFilter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("Language", sap.ui.model.FilterOperator.EQ, lang),
							new sap.ui.model.Filter("Salesorg", sap.ui.model.FilterOperator.EQ, that.salesOrgDataAccess)
						],
						and: true
					});
					filters.push(oFilter);
					var busyDialog = new sap.m.BusyDialog();
					busyDialog.open();
					oDataModel.read("/ZSearchHelp_SalesOrgSet", {
						async: false,
						filters: filters,
						success: function (oData, oResponse) {
							busyDialog.close();
							var salesOrgModel = new sap.ui.model.json.JSONModel({
								"results": oData.results
							});
							that.salesOrg.setModel(salesOrgModel, "salesOrgModel");
							that.salesOrg.open();
						},
						error: function (error) {
							busyDialog.close();
							var errorMsg = "";
							if (error.statusCode === 504) {
								errorMsg = that.getView().getModel("i18n").getProperty("timeout");
								sap.m.MessageToast.error(errorMsg);
							} else {
								errorMsg = JSON.parse(error.responseText);
								errorMsg = errorMsg.error.message.value;
								sap.m.MessageToast.error(errorMsg);
							}
						}
					});
				} else {
					that.salesOrg.open();
				}
			}
		},
		onClear: function () {
			var oModel = this.getView().getModel("oModel");
			oModel.setData({
				"custCode": "",
				"oldCustCode": "",
				"salesOrg": ""
			});
			this.getView().byId("searchField").setValue("");
			this.getView().byId("ATPSalesOrgFromID").destroyTokens();
			this.salesOrgFromSelectedItems = [];
			oModel.refresh();
			var oTableModel = this.getView().getModel("oTableModel");
			if (oTableModel) {
				oTableModel.setData();
				oTableModel.refresh();
			}
		},
		mandatoryCheck: function (oModelData) {
			if (oModelData.custCode || oModelData.name || oModelData.oldCustCode)
				return true;
			else {
				sap.m.MessageBox.information(this.getView().getModel("i18n").getProperty("enterApartsorg"));
				return false;
			}
		},
		onRowSelect: function (oEvent) {
			if (this.getView().getModel("device").getProperty("/system/phone")) {
				var tblModel = new sap.ui.model.json.JSONModel();
				var oTableModel = this.getView().byId("tableId").getModel("oTableModel");
				var obj = oTableModel.getProperty(oEvent.getSource().getBindingContext("oTableModel").sPath); //oEvent.getSource()._aSelectedPaths[0]
				var aData = {
					"postCode": obj.postCode,
					"salesOrg": incture.com.MaterialEnquiry.model.formatter.f4ValueBind(obj.salesOrg, obj.sOrgName)
				};
				// var obj = oEvent.getSource().getBindingContext("oTableModel").getObject();
				var oButton = oEvent.getSource();
				if (!this._oPopover) {
					Fragment.load({
						name: "incture.com.ConnectClientCustomeEnquiry.view.Fragments.popOver",
						controller: this
					}).then(function (pPopover) {
						this._oPopover = pPopover;
						this.getView().addDependent(this._oPopover);
						aData = aData;
						tblModel.setData(aData);
						this._oPopover.setModel(tblModel, "tblModel");
						this._oPopover.openBy(oButton);

					}.bind(this));
				} else {
					aData = aData;
					tblModel.setData(aData);
					this._oPopover.setModel(tblModel, "tblModel");
					this._oPopover.openBy(oButton);
				}
			}
		},
		onConfirmChangeSalesOrg: function (oEvent) {
			this.getView().getModel("oModel").getData().SalesOrgValueState = "None";
			oEvent.getSource().getBinding("items").filter([]);
			var oMultiInput = this.byId("ATPSalesOrgFromID");
			this.salesOrgFromSelectedItems = [];
			if (oEvent.getParameters().selectedContexts.length > 0) {
				for (var i = 0; i < oEvent.getParameters().selectedContexts.length; i++) {
					// this.getView().getModel("baseModel").getData().EndingStckplant.push(oEvent.getParameters().selectedContexts[i].getObject().plant);
					this.salesOrgFromSelectedItems.push(oEvent.getParameters().selectedContexts[i].getObject().Salesorg);
					oMultiInput.addToken(new Token({
						text: oEvent.getParameters().selectedContexts[i].getObject().Salesorg
					}));
					// return new Token({text: oEvent.getParameters().selectedContexts[i].getObject().Salesorg});
				}
			} else {
				sap.m.MessageBox.error(this.getView().getModel("i18n").getProperty("selectAtleastOne"));
			}
		},
		onCancelValueHelp: function (oEvent) {
			oEvent.getSource().getBinding("items").filter([]);
		},
		onSearch: function () {
			if (!this.allAccess) {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("DataAccessControl"));
			} else {
				var oModel = this.getView().getModel("oModel"),
					oModelData = oModel.getData();
				if (this.mandatoryCheck(oModelData)) {
					var oDataModel = this.getView().getModel("ZDKSH_CC_MASTER_ENQUIRIES_SRV");
					var filters = [],
						a = [],
						lang, filters1 = [];
					if (this.salesOrgFromSelectedItems.length > 0) {
						for (var i = 0; i < this.salesOrgFromSelectedItems.length; i++) {
							filters1.push(new sap.ui.model.Filter("salesOrg", sap.ui.model.FilterOperator.EQ, this.salesOrgFromSelectedItems[i]));
						}
						var newFilter = new sap.ui.model.Filter({
							filters: filters1,
							or: true //OR token.getKey(), depending on whjat do you store in key/value
						});
					}
					//  [
					// 	new sap.ui.model.Filter("custCode", sap.ui.model.FilterOperator.EQ, oModelData.custCode),
					// 	new sap.ui.model.Filter("salesOrg", sap.ui.model.FilterOperator.EQ, oModelData.salesOrg),
					// 	new sap.ui.model.Filter("oldCustCode", sap.ui.model.FilterOperator.EQ, oModelData.oldCustCode)
					// ]
					if (sap.ushell && sap.ushell.Container) {
						lang = sap.ui.getCore().getConfiguration().getLanguage();
						if (lang.toLowerCase() == "en")
							lang = "E";
						else
							lang = 2;
					} else {
						lang = "E";
					}
					if (this.distrChannelDataAccess) {
						a.push(new sap.ui.model.Filter("channel", sap.ui.model.FilterOperator.EQ, this.distrChannelDataAccess));
					}
					if (this.custCodeDataAccess && this.custCodeDataAccess != "*") {
						a.push(new sap.ui.model.Filter("custNumEx", sap.ui.model.FilterOperator.EQ, this.custCodeDataAccess));
					}
					if (this.divisionDataAccess) {
						a.push(new sap.ui.model.Filter("division", sap.ui.model.FilterOperator.EQ, this.divisionDataAccess));
					}
					if (oModelData.custCode)
						a.push(new sap.ui.model.Filter("custCode", sap.ui.model.FilterOperator.EQ, oModelData.custCode));
					if (this.salesOrgFromSelectedItems.length > 0)
						a.push(newFilter);
					else
						a.push(new sap.ui.model.Filter("salesOrg", sap.ui.model.FilterOperator.EQ, this.salesOrgDataAccess));
					if (oModelData.oldCustCode)
						a.push(new sap.ui.model.Filter("oldCustCode", sap.ui.model.FilterOperator.EQ, oModelData.oldCustCode));
					// if (oModelData.name && lang == "E")
					// 	a.push(new sap.ui.model.Filter("nameInEN", sap.ui.model.FilterOperator.EQ, "*" + oModelData.name + "*"));
					// else if (oModelData.name && lang == 2)
					// 	a.push(new sap.ui.model.Filter("name2", sap.ui.model.FilterOperator.EQ, "*" + oModelData.name + "*"));
					// a.push(new sap.ui.model.Filter("languageID", sap.ui.model.FilterOperator.EQ, lang));
					// var oFilter = new sap.ui.model.Filter({
					// 	filters: a,
					// 	and: true
					// });
					// filters.push(oFilter);
					if (oModelData.name)
						a.push(new sap.ui.model.Filter("nameInEN", sap.ui.model.FilterOperator.EQ, "*" + oModelData.name + "*"));
					var that = this;
					var busyDialog = new sap.m.BusyDialog();
					busyDialog.open();
					oDataModel.read("/CustomerMasterSet", {
						async: false,
						filters: a ,
						success: function (oData, oResponse) {
							var oTableModel = new sap.ui.model.json.JSONModel();
							oTableModel.setSizeLimit(oData.results.length);
							that.getView().setModel(oTableModel, "oTableModel");
							oTableModel.setData(oData);
							that.getView().byId("searchField").setValue("");
							if (oData.results.length > 0) {
								that.getView().byId("exportId").setEnabled(true);
								oTableModel.setSizeLimit(oData.results.length);
							} else {
								that.getView().byId("exportId").setEnabled(false);
							}
							busyDialog.close();
						},
						error: function (error) {
							var oTableModel = new sap.ui.model.json.JSONModel();
							that.getView().setModel(oTableModel, "oTableModel");
							oTableModel.setData("");
							busyDialog.close();
							var errorMsg = "";
							if (error.responseText.includes("abnormal terminated")) {
								errorMsg = that.getView().getModel("i18n").getProperty("timeout");
								sap.m.MessageBox.error(errorMsg);
							} else if (error.status == 504) {
								errorMsg = that.getView().getModel("i18n").getProperty("dataNotFound");
								sap.m.MessageBox.error(errorMsg);
							} else {
								errorMsg = JSON.parse(error.responseText);
								errorMsg = errorMsg.error.message.value;
								sap.m.MessageBox.error(errorMsg);
							}
						}
					});
				}
			}
		},
		onCancelSoldtoParty: function (oEvent) {
			this.CustCodeFrag.close();
			this.onResetSoldToParty();
		},
		onDeleteSalesOrg: function (oEvent) {
			if (oEvent.getParameters().type === "removed") {
				var delToken = oEvent.getParameters().removedTokens[0].mProperties.text;
				for (var i = this.salesOrgFromSelectedItems.length; i >= 0; i--) {
					if (delToken === this.salesOrgFromSelectedItems[i]) {
						this.salesOrgFromSelectedItems.splice(i, 1);
					}
				}
			} else {
				this.salesOrgFromSelectedItems.push(oEvent.getParameters().addedTokens[0].getText());
			}
		},
		onResetSoldToParty: function (oEvent) {
			this.getView().getModel("SoldToPartyModSet").setData({
				CustId: "",
				CustIdDesc: "",
				CustName: "",
				CustNameDesc: "",
				Division: "",
				DivisionDesc: "",
				SalesOrg: "",
				SalesOrgDesc: "",
				DistChan: "",
				DistChanDesc: "",
				sapMaterialNum: ""
			});
			this.getView().getModel("SoldToPartyModSet").refresh();
			var aCustmerList = this.CustCodeFrag.getModel("SoldToPartyListSet");
			if (aCustmerList !== undefined) {
				this.CustCodeFrag.getModel("SoldToPartyListSet").setData([]);
				this.CustCodeFrag.getModel("SoldToPartyListSet").refresh(true);
			}
		},
		onLiveChange: function (oEvent) {
			var value;
			if (oEvent.getParameters().newValue === undefined) {
				value = oEvent.getParameters().query;
			} else {
				value = oEvent.getParameters().newValue;
			}
			var filters = [];
			var oFilter = new sap.ui.model.Filter([new sap.ui.model.Filter("custCode", sap.ui.model.FilterOperator.Contains, value),
				new sap.ui.model.Filter("salesOrg", sap.ui.model.FilterOperator.Contains, value),
				new sap.ui.model.Filter("sOrgName", sap.ui.model.FilterOperator.Contains, value),
				new sap.ui.model.Filter("titleInLocalName", sap.ui.model.FilterOperator.Contains, value),
				new sap.ui.model.Filter("nameInTH", sap.ui.model.FilterOperator.Contains, value),
				new sap.ui.model.Filter("nameInEN", sap.ui.model.FilterOperator.Contains, value),
				new sap.ui.model.Filter("channel", sap.ui.model.FilterOperator.Contains, value),
				new sap.ui.model.Filter("city", sap.ui.model.FilterOperator.Contains, value),
				new sap.ui.model.Filter("province", sap.ui.model.FilterOperator.Contains, value),
				new sap.ui.model.Filter("postCode", sap.ui.model.FilterOperator.Contains, value)
			]);
			filters.push(oFilter);
			var oBinding = this.getView().byId("tableId").getBinding("items");
			oBinding.filter(filters);
		},
		onPressCollapse: function () {
			this.getView().getModel("baseModel").setProperty("/openVisiblity", true);
			this.getView().getModel("baseModel").setProperty("/CollapseVisiblity", false);
			this.getView().getModel("baseModel").setProperty("/SearchVisiblity", false);
		},
		onPressOpen: function () {
			this.getView().getModel("baseModel").setProperty("/openVisiblity", false);
			this.getView().getModel("baseModel").setProperty("/CollapseVisiblity", true);
			this.getView().getModel("baseModel").setProperty("/SearchVisiblity", true);
		},
		onExport: function () {
			var arr = this.getView().getModel("oTableModel").getData().results;
			for (var i = 0; i < arr.length; i++) {
				arr[i].cSalesOrg = arr[i].sOrgName ? arr[i].salesOrg + "(" + arr[i].sOrgName + ")" : arr[i].salesOrg;
				arr[i].cName = arr[i].nameInTH ? arr[i].titleInLocalName + "(" + arr[i].nameInTH + ")" : arr[i].nameInTH;
				arr[i].cchannel = arr[i].channel ? arr[i].channel + "(" + arr[i].dcName + ")" : arr[i].channel;
			}
			var aCols = [{
				label: 'Customer Code',
				property: 'custCode'
			}, {
				label: 'Sales Org',
				property: 'cSalesOrg'

			}, {
				label: 'Name (Local)',
				property: 'cName'
			}, {
				label: 'Name EN',
				property: 'nameInEN'
			}, {
				label: 'Dist Channel',
				property: 'cchannel'
			}, {
				label: 'City',
				property: 'city'
			}, {
				label: 'Province',
				property: 'province'
			}, {
				label: 'Post Code',
				property: 'postCode'
			}];
			var aCols, oSettings, oSheet;
			aCols = aCols;
			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: arr,
				showProgress: false
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then(function () {
					// MessageToast.show("spreadsheet Export Finished");
				})
				.finally(function () {
					oSheet.destroy();
				});
		},
		// onExport: function () {

		// 	var model = this.getView().getModel("oTableModel");
		// 	var oExport = new Export({

		// 		// Type that will be used to generate the content. Own ExportType's can be created to support other formats
		// 		exportType: new ExportTypeCSV({
		// 			fileExtension: "xls",
		// 			separatorChar: "\t",
		// 			charset: "utf-8",
		// 			mimeType: "application/vnd.ms-excel"
		// 		}),

		// 		// Pass in the model created above
		// 		models: model,

		// 		// binding information for the rows aggregation
		// 		rows: {
		// 			path: "/results"
		// 		},

		// 		// column definitions with column name and binding info for the content
		// 		columns: [{
		// 			name: "Customer Code",
		// 			template: {
		// 				content: "{custCode}"
		// 			}
		// 		}, {
		// 			name: "Sale Org",
		// 			template: {
		// 				content: "{salesOrg}"
		// 			}
		// 		}, {
		// 			name: "Title",
		// 			template: {
		// 				content: "{titleInLocalName}"
		// 			}
		// 		}, {
		// 			name: "Name TH",
		// 			template: {
		// 				content: "{nameInEN}"
		// 			}
		// 		}, {
		// 			name: "Name EN",
		// 			template: {
		// 				content: "{nameInTH}"
		// 			}
		// 		}, {
		// 			name: "Channel",
		// 			template: {
		// 				content: "{channel}"
		// 			}
		// 		}, {
		// 			name: "City",
		// 			template: {
		// 				content: "{city}"
		// 			}
		// 		}, {
		// 			name: "Province",
		// 			template: {
		// 				content: "{province}"
		// 			}
		// 		}, {
		// 			name: "Post Code",
		// 			template: {
		// 				content: "{postCode}"
		// 			}
		// 		}]
		// 	});

		// 	// download exported file
		// 	oExport.saveFile().catch(function (oError) {
		// 		// MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
		// 	}).then(function () {
		// 		oExport.destroy();
		// 	});

		// }

	});
});