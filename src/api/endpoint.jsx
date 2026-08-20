class Endpoints {
  constructor() {
    this.serverAddresses = {
      primary: "https://backend1.quicksmart.in/resellerservices",
      secondary: "https://backend7.quicksmart.in/telco-summary-manager",
      newAdmin: "https://backendnewadmin.quicksmart.in/resellerservices",
    };

    this.endpoints = {
      login: { path: "reseller/login", server: "primary"},
      verifyOtp: { path: "reseller/verifyotp", server: "primary" },

      profileDetails: { path: "userProfile/userProfileDetails", server: "primary" },
      creditAlertNotification: { path: "creditNotification", server: "primary" },
  
      dashboard: { path: "reseller/dashboard", server: "primary"},
      getHourlyReport: { path: "reportService/getHourlySummaryReport", server: "primary" },
      summaryReport: { path: "reportService/summaryReport", server: "primary" },

      getAllOrganization: { path: "organisationService/getAllOrganisationsList", server: "newAdmin" },
      saveOrganization: { path: "organisationService/saveOrganisation", server: "primary" },

      //Department Management
      getAlldepartment: { path: "departmentService/getAllDepartmentsList", server: "newAdmin" },
      saveDepartment: { path: "departmentService/saveDepartment", server: "primary" },

      //Internal User
      listInternalusers: { path: "userService/getAllInternalUsersList", server: "primary" },
      saveInternalUser: { path: "userService/saveInternalUser", server: "primary" },
      listSeniorAccountManagers: { path: "userService/getAllAccManagers", server: "primary" },
      regionalManagersList: { path: "userService/getAllRegionalManagers", server: "primary" },

      //External User
      externalListUser: { path: "staticService/getAllChildUserDetails", server: "primary" },

      getUserApiKey: { path: "pushApiKeyService/getUserApiKey", server: "primary" },
      generateNewApiKey: { path: "pushApiKeyService/generateUserApiKey", server: "primary" },

      getAllUsers: { path: "staticService/getAllChildsForUser", server: "primary" },
      getCreditHistory: { path: "creditService/getCreditHistory", server: "primary" },
      viewCreditForUser: { path: "creditService/getAvailableCreditForUser", server: "primary" },
      updateCredit: { path: "creditService/updateCreditForUser", server: "primary" },

      drSummaryApi: { path: "reseller/drSummary", server: "primary"},

      //Manage Connect
      getUserRoutingGroups: { path: "reseller/getUserRoutingGroups", server: "primary" },
      viewRoutingGroups: { path: "reseller/viewRoutingGroupDetails", server: "primary" },
      getUserKennalList: { path: "reseller/getUserKannelList", server: "primary" },
      updatedKennalGroupMap: { path: "reseller/updateKannelGroupMapping", server: "primary" },

      //New User Routing
      unroutedUserlist: { path: "reseller/unroutedUsers", server: "primary"},
      saveNewUserRouting: { path: "reseller/newUserRouting", server: "primary"},

      //Switch Gateway
      getAllOperatorsName: { path: "reseller/operatorNames", server: "primary" }, 
      switchGatewayOperator: { path: "reseller/operatorChange", server: "primary"},

      //Userwise Routing
     userwiseMessageType: { path: "reseller/routedUsers", server: "primary"},
     userListDataOptions: { path: "reseller/routingDetails", server: "primary"},
     editUserRoutingData: { path: "reseller/editRouting", server: "primary"},
     addNewUserRouting: { path: "reseller/addRouting", server: "primary"},
     updatedUserRouting: { path: "reseller/updateRouting", server: "primary"},

      currentTelcoSummary: { path: "getUserConnectSummaryForDate", server: "secondary" },
      connectSummary: { path: "connectSummaryService/connectSummary", server: "primary" },

      searchMobileNumber: { path: "getGlobalBlackListMobileNumber", server: "primary" },
      deleteBlacklistNumber: { path: "deleteNumberInDb", server: "primary" },
      addBlacklistNumber: { path: "addSingleNumber", server: "primary" },
      uploadBlacklistNumber: { path: "uploadFile", server: "primary" },

      //User Premium Routing
      getAllUsername: { path: "getallclient", server: "primary"},
      getAllRoutingName: { path: "getgroupid", server: "primary"},
      addPremiumNumber: { path: "addnumberinRouting", server: "primary" },
      uploadPremiumNumber: { path: "uploadnumberrouting", server: "primary" },
      usernameSearchSelect: { path: "searchbasedonnumber", server: "primary"},
      descriptionByUsername: { path: "getdescription", server: "primary"},
      deleteSelectedRows: { path: "delete", server: "primary"},
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