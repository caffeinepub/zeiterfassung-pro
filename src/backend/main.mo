import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat8 "mo:core/Nat8";
import Nat32 "mo:core/Nat32";
import Nat16 "mo:core/Nat16";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  public type ClientId = Nat32;
  public type TimeEntryId = Nat32;
  public type ExpenseId = Nat32;
  public type InvoiceId = Nat32;

  public type Client = {
    id : ClientId;
    name : Text;
    address : Text;
    rate : Float;
    contact : Text;
  };

  public type TimeEntry = {
    id : TimeEntryId;
    clientId : ClientId;
    date : Int;
    startTime : Int;
    endTime : Int;
    description : Text;
    duration : Float;
    amount : Float;
  };

  public type Expense = {
    id : ExpenseId;
    clientId : ClientId;
    date : Int;
    amount : Float;
    description : Text;
  };

  public type InvoiceStatus = {
    #draft;
    #sent;
  };

  public type Invoice = {
    id : InvoiceId;
    clientId : ClientId;
    month : Nat8;
    year : Nat16;
    timeEntryIds : [TimeEntryId];
    expenseIds : [ExpenseId];
    smallExpenseFlatRate : Float;
    vatRate : Float;
    netAmount : Float;
    vatAmount : Float;
    grossAmount : Float;
    createdDate : Int;
    status : InvoiceStatus;
  };

  public type Settings = {
    companyName : Text;
    address : Text;
    vatRate : Float;
    smallExpenseFlatRate : Float;
    standardRate : Float;
  };

  public type DashboardData = {
    clientId : ClientId;
    openHours : Float;
    openAmount : Float;
  };

  public type UserProfile = {
    name : Text;
  };

  var nextClientId : ClientId = 1;
  var nextTimeEntryId : TimeEntryId = 1;
  var nextExpenseId : ExpenseId = 1;
  var nextInvoiceId : InvoiceId = 1;

  var settings : Settings = {
    companyName = "";
    address = "";
    vatRate = 8.1;
    smallExpenseFlatRate = 10.0;
    standardRate = 100.0;
  };

  let clients = Map.empty<ClientId, Client>();
  let timeEntries = Map.empty<TimeEntryId, TimeEntry>();
  let expenses = Map.empty<ExpenseId, Expense>();
  let invoices = Map.empty<InvoiceId, Invoice>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Client Management (Admin-only)
  public shared ({ caller }) func createClient(name : Text, address : Text, rate : Float, contact : Text) : async ClientId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create clients");
    };
    let id = nextClientId;
    nextClientId += 1;
    let client : Client = {
      id;
      name;
      address;
      rate;
      contact;
    };
    clients.add(id, client);
    id;
  };

  public shared ({ caller }) func updateClient(client : Client) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update clients");
    };
    if (not clients.containsKey(client.id)) {
      Runtime.trap("Client not found");
    };
    clients.add(client.id, client);
  };

  public shared ({ caller }) func deleteClient(id : ClientId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete clients");
    };
    clients.remove(id);
  };

  public query ({ caller }) func getClient(id : ClientId) : async ?Client {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clients");
    };
    clients.get(id);
  };

  public query ({ caller }) func getAllClients() : async [Client] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clients");
    };
    clients.values().toArray();
  };

  // Time Entry Management (User-level)
  public shared ({ caller }) func createTimeEntry(clientId : ClientId, date : Int, startTime : Int, endTime : Int, description : Text) : async TimeEntryId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create time entries");
    };
    let id = nextTimeEntryId;
    nextTimeEntryId += 1;
    let duration = ((endTime - startTime).toFloat() / 60.0 + 14.0) / 15.0 * 15.0;
    let rate = switch (clients.get(clientId)) {
      case (null) { settings.standardRate };
      case (?client) { client.rate };
    };
    let amount = duration / 60.0 * rate;
    let timeEntry : TimeEntry = {
      id;
      clientId;
      date;
      startTime;
      endTime;
      description;
      duration;
      amount;
    };
    timeEntries.add(id, timeEntry);
    id;
  };

  public shared ({ caller }) func updateTimeEntry(timeEntry : TimeEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update time entries");
    };
    if (not timeEntries.containsKey(timeEntry.id)) {
      Runtime.trap("Time entry not found");
    };
    timeEntries.add(timeEntry.id, timeEntry);
  };

  public shared ({ caller }) func deleteTimeEntry(id : TimeEntryId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete time entries");
    };
    timeEntries.remove(id);
  };

  public query ({ caller }) func getTimeEntry(id : TimeEntryId) : async ?TimeEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view time entries");
    };
    timeEntries.get(id);
  };

  public query ({ caller }) func getAllTimeEntries() : async [TimeEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view time entries");
    };
    timeEntries.values().toArray();
  };

  // Expense Management (User-level)
  public shared ({ caller }) func createExpense(clientId : ClientId, date : Int, amount : Float, description : Text) : async ExpenseId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create expenses");
    };
    let id = nextExpenseId;
    nextExpenseId += 1;
    let expense : Expense = {
      id;
      clientId;
      date;
      amount;
      description;
    };
    expenses.add(id, expense);
    id;
  };

  public shared ({ caller }) func updateExpense(expense : Expense) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update expenses");
    };
    if (not expenses.containsKey(expense.id)) {
      Runtime.trap("Expense not found");
    };
    expenses.add(expense.id, expense);
  };

  public shared ({ caller }) func deleteExpense(id : ExpenseId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete expenses");
    };
    expenses.remove(id);
  };

  public query ({ caller }) func getExpense(id : ExpenseId) : async ?Expense {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expenses");
    };
    expenses.get(id);
  };

  public query ({ caller }) func getAllExpenses() : async [Expense] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expenses");
    };
    expenses.values().toArray();
  };

  // Invoice Management (Admin-only)
  public shared ({ caller }) func generateInvoice(clientId : ClientId, month : Nat8, year : Nat16) : async InvoiceId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate invoices");
    };
    let id = nextInvoiceId;
    nextInvoiceId += 1;

    let filteredTimeEntries = timeEntries.filter(func(_, t) {
      t.clientId == clientId and t.date % 100 == month and (t.date / 100) % 10000 == year
    });
    let timeEntryIds = filteredTimeEntries.keys().toArray();
    let filteredExpenses = expenses.filter(func(_, e) {
      e.clientId == clientId and e.date % 100 == month and (e.date / 100) % 10000 == year
    });
    let expenseIds = filteredExpenses.keys().toArray();

    var timeEntriesSum = 0.0;
    for (timeEntry in filteredTimeEntries.values()) {
      timeEntriesSum += timeEntry.amount;
    };

    var expensesSum = 0.0;
    for (expense in filteredExpenses.values()) {
      expensesSum += expense.amount;
    };

    let netAmount = timeEntriesSum + expensesSum;
    let vatAmount = netAmount * (settings.vatRate / 100.0);
    let grossAmount = netAmount + vatAmount + settings.smallExpenseFlatRate;
    let invoice : Invoice = {
      id;
      clientId;
      month;
      year;
      timeEntryIds;
      expenseIds;
      smallExpenseFlatRate = settings.smallExpenseFlatRate;
      vatRate = settings.vatRate;
      netAmount;
      vatAmount;
      grossAmount;
      createdDate = Time.now();
      status = #draft;
    };
    invoices.add(id, invoice);
    id;
  };

  public shared ({ caller }) func sendInvoice(id : InvoiceId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can send invoices");
    };
    switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice not found") };
      case (?invoice) {
        invoices.add(id, { invoice with status = #sent });
      };
    };
  };

  public query ({ caller }) func getInvoice(id : InvoiceId) : async ?Invoice {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };
    invoices.get(id);
  };

  public query ({ caller }) func getAllInvoices() : async [Invoice] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };
    invoices.values().toArray();
  };

  // Settings Management (Admin-only)
  public shared ({ caller }) func updateSettings(newSettings : Settings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update settings");
    };
    settings := newSettings;
  };

  public query ({ caller }) func getSettings() : async Settings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view settings");
    };
    settings;
  };

  // Dashboard (User-level)
  public query ({ caller }) func getDashboardData() : async [DashboardData] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard data");
    };
    let dashboard = List.empty<DashboardData>();
    for ((id, client) in clients.entries()) {
      var openHours = 0.0;
      var openAmount = 0.0;
      for (timeEntry in timeEntries.values()) {
        if (timeEntry.clientId == id) {
          openHours += timeEntry.duration / 60.0;
          openAmount += timeEntry.amount;
        };
      };
      dashboard.add({
        clientId = id;
        openHours;
        openAmount;
      });
    };
    dashboard.toArray();
  };
};
