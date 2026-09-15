class Endpoints {
  constructor() {
    this.serverAddresses = {
      primary: "https://backend1.quicksmart.in/resellerservices",
      secondary: "https://backend7.quicksmart.in/telco-summary-manager",
      newAdmin: "https://backendnewadmin.quicksmart.in/resellerservices",
    };

    this.endpoints = {
      login: { path: "reseller/login", server: "newAdmin"},
      verifyOtp: { path: "reseller/verifyotp", server: "newAdmin" },

      profileDetails: { path: "userProfile/userProfileDetails", server: "newAdmin" },
      updatedPassword: { path: "userProfile/updatedPassword", server: "newAdmin" },
      creditAlertNotification: { path: "creditNotification", server: "newAdmin" },
  
      dashboard: { path: "reseller/dashboard", server: "newAdmin"},
      getHourlyReport: { path: "reportService/getHourlySummaryReport", server: "newAdmin" },
      summaryReport: { path: "reportService/summaryReport", server: "newAdmin" },

      getAllOrganization: { path: "organisationService/getAllOrganisationsList", server: "newAdmin" },
      saveOrganization: { path: "organisationService/saveOrganisation", server: "newAdmin" },

      //Department Management
      getAlldepartment: { path: "departmentService/getAllDepartmentsList", server: "newAdmin" },
      saveDepartment: { path: "departmentService/saveDepartment", server: "newAdmin" },

      //Internal User
      listInternalusers: { path: "userService/getAllInternalUsersList", server: "newAdmin" },
      getInternalUserData: { path: "userService/viewInternalUser", server: "newAdmin" },
      saveInternalUser: { path: "userService/saveInternalUser", server: "newAdmin" },
      listSeniorAccountManagers: { path: "userService/getAllAccManagers", server: "newAdmin" },
      regionalManagersList: { path: "userService/getAllRegionalManagers", server: "newAdmin" },

      //External User
      externalListUser: { path: "staticService/getAllChildUserDetails", server: "newAdmin" },

      getUserApiKey: { path: "pushApiKeyService/getUserApiKey", server: "newAdmin" },
      generateNewApiKey: { path: "pushApiKeyService/generateUserApiKey", server: "newAdmin" },

      getAllUsers: { path: "staticService/getAllChildsForUser", server: "newAdmin" },
      getCreditHistory: { path: "creditService/getCreditHistory", server: "newAdmin" },
      viewCreditForUser: { path: "creditService/getAvailableCreditForUser", server: "newAdmin" },
      updateCredit: { path: "creditService/updateCreditForUser", server: "newAdmin" },

      drSummaryApi: { path: "reseller/drSummary", server: "newAdmin"},


      //Detailed MIS Report
      detailedMisReport: { path: "reportService/detailedMis", server: "newAdmin" },

      //Summary Report
      senderIdSummaryReport: { path: "reportService/senderIdSummaryReport", server: "newAdmin" },

      //Errorcode Report
      errorcodeReport: {path: "reportService/errorCodeWiseReport", server: "newAdmin"},

      //Manage Connect
      getUserRoutingGroups: { path: "reseller/getUserRoutingGroups", server: "newAdmin" },
      viewRoutingGroups: { path: "reseller/viewRoutingGroupDetails", server: "newAdmin" },
      getUserKennalList: { path: "reseller/getUserKannelList", server: "newAdmin" },
      updatedKennalGroupMap: { path: "reseller/updateKannelGroupMapping", server: "newAdmin" },

      //New User Routing
      unroutedUserlist: { path: "reseller/unroutedUsers", server: "newAdmin"},
      saveNewUserRouting: { path: "reseller/newUserRouting", server: "newAdmin"},

      //Switch Gateway
      getAllOperatorsName: { path: "reseller/operatorNames", server: "newAdmin" }, 
      switchGatewayOperator: { path: "reseller/operatorChange", server: "newAdmin"},

      //Userwise Routing
      userwiseMessageType: { path: "reseller/routedUsers", server: "newAdmin"},
      userListDataOptions: { path: "reseller/routingDetails", server: "newAdmin"},
      editUserRoutingData: { path: "reseller/editRouting", server: "newAdmin"},
      addNewUserRouting: { path: "reseller/addRouting", server: "newAdmin"},
      updatedUserRouting: { path: "reseller/updateRouting", server: "newAdmin"},

      //SMPP Management
      smppStatus: { path: "reseller/getSmppStats", server: "newAdmin" },

      currentTelcoSummary: { path: "getUserConnectSummaryForDate", server: "secondary" },
      connectSummary: { path: "connectSummaryService/connectSummary", server: "newAdmin" },

      searchMobileNumber: { path: "getGlobalBlackListMobileNumber", server: "newAdmin" },
      deleteBlacklistNumber: { path: "deleteNumberInDb", server: "newAdmin" },
      addBlacklistNumber: { path: "addSingleNumber", server: "newAdmin" },
      uploadBlacklistNumber: { path: "uploadFile", server: "newAdmin" },
      editBlacklistNumber: { path: "editGlobalBlackListNumber", server: "newAdmin"},

      //User Premium Routing
      getAllUsername: { path: "getallclient", server: "newAdmin"},
      getAllRoutingName: { path: "getgroupid", server: "newAdmin"},
      addPremiumNumber: { path: "addnumberinRouting", server: "newAdmin" },
      uploadPremiumNumber: { path: "uploadnumberrouting", server: "newAdmin" },
      usernameSearchSelect: { path: "searchbasedonnumber", server: "newAdmin"},
      descriptionByUsername: { path: "getdescription", server: "newAdmin"},
      deleteSelectedRows: { path: "delete", server: "newAdmin"},
      updateGroupNameApi: { path: "updategroupid", server: "newAdmin"},

      uploadLogo: { path: "reseller/uploadLogo", server: "newAdmin" },
      uploadFavicon: { path: "reseller/uploadFavicon", server: "newAdmin" },
      getFavicon: { path: "reseller/getFavicon", server: "newAdmin" },
    };
  }

  get(name) {
    const endpoint = this.endpoints[name];

    if (!endpoint) {
      console.error(`Endpoint '${name}' not found`);
      return null;
    }

    return `${this.serverAddresses[endpoint.server]}/${endpoint.path}`;
  }

  async post(endpointName, payload = {}) {

  const userData = JSON.parse(
    localStorage.getItem("userData")
  );

  const response = await fetch(this.get(endpointName), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: userData?.authJwtToken || "",
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

  async getRequest(endpointName) {
    const response = await fetch(
      this.get(endpointName)
    );

    return response.json();
  }
}

export default new Endpoints();