import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Int "mo:core/Int";
import List "mo:core/List";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type GameType = {
    #coinFlip;
    #diceRoll;
    #roulette;
    #blackjack;
  };

  type RouletteBet = {
    #color : Text;
    #number : Nat;
  };

  type GameResult = {
    gameType : GameType;
    betAmount : Nat;
    outcome : Text;
    won : Bool;
    payout : Nat;
  };

  type Transaction = {
    type_ : Text;
    amount : Int;
    timestamp : Int;
  };

  type UserProfile = {
    username : Text;
    joinDate : Time.Time;
    totalGames : Nat;
    totalWon : Nat;
    totalLost : Nat;
    balance : Nat;
  };

  type Promotion = {
    title : Text;
    description : Text;
    bonusAmount : Nat;
  };

  module UserProfile {
    public func compareByBalance(a : UserProfile, b : UserProfile) : Order.Order {
      Nat.compare(b.balance, a.balance);
    };
  };

  // Initialize state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let users = Map.empty<Principal, UserProfile>();
  let gameResults = Map.empty<Principal, [GameResult]>();
  let transactionHistory = Map.empty<Principal, [Transaction]>();
  let promotions = Map.empty<Nat, Promotion>();

  public shared ({ caller }) func registerUser(username : Text) : async () {
    if (users.containsKey(caller)) { Runtime.trap("User already registered") };

    let profile = {
      username;
      joinDate = Time.now();
      totalGames = 0;
      totalWon = 0;
      totalLost = 0;
      balance = 1000;
    };

    users.add(caller, profile);
    gameResults.add(caller, []);
    transactionHistory.add(caller, []);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
  };

  public query ({ caller }) func getBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view balance");
    };
    let profile = getUserProfile_internal(caller);
    profile.balance;
  };

  public shared ({ caller }) func deposit(amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can deposit");
    };
    let profile = getUserProfile_internal(caller);

    let newProfile = {
      profile with
      balance = profile.balance + amount
    };
    users.add(caller, newProfile);

    let transaction = {
      type_ = "deposit";
      amount = amount.toInt();
      timestamp = Time.now();
    };

    let history = getOrInitializeTransactionHistory(caller);
    let listHistory = List.fromArray<Transaction>(history);
    listHistory.add(transaction);
    transactionHistory.add(caller, listHistory.toArray());
  };

  public shared ({ caller }) func withdraw(amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can withdraw");
    };
    let profile = getUserProfile_internal(caller);

    if (profile.balance < amount) {
      Runtime.trap("Insufficient balance");
    };

    let newProfile = {
      profile with
      balance = profile.balance - amount
    };
    users.add(caller, newProfile);

    let transaction = {
      type_ = "withdraw";
      amount = -1 * amount.toInt();
      timestamp = Time.now();
    };

    let history = getOrInitializeTransactionHistory(caller);
    let listHistory = List.fromArray<Transaction>(history);
    listHistory.add(transaction);
    transactionHistory.add(caller, listHistory.toArray());
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    getUserProfile_internal(user);
  };

  func getUserProfile_internal(user : Principal) : UserProfile {
    switch (users.get(user)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("User not found") };
    };
  };

  func getOrInitializeTransactionHistory(user : Principal) : [Transaction] {
    switch (transactionHistory.get(user)) {
      case (?history) { history };
      case (null) {
        let newHistory : [Transaction] = [];
        transactionHistory.add(user, newHistory);
        newHistory;
      };
    };
  };

  public query ({ caller }) func getTransactionHistory() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transaction history");
    };
    getOrInitializeTransactionHistory(caller);
  };

  public query ({ caller }) func getAllPromotions() : async [Promotion] {
    let iter = promotions.values();
    iter.toArray();
  };

  func getGameResults(user : Principal) : [GameResult] {
    switch (gameResults.get(user)) {
      case (?results) { results };
      case (null) {
        let newResults : [GameResult] = [];
        gameResults.add(user, newResults);
        newResults;
      };
    };
  };

  // Helper method to update user profile after game
  func updateUserProfileAfterGame(user : Principal, won : Bool, amount : Nat) {
    let profile = getUserProfile_internal(user);

    let newProfile = {
      profile with
      totalGames = profile.totalGames + 1;
      totalWon = profile.totalWon + (if (won) { amount } else { 0 });
      totalLost = profile.totalLost + (if (won) { 0 } else { amount });
      balance = if (won) { profile.balance + amount } else {
        Int.abs(profile.balance.toInt() - amount.toInt());
      };
    };
    users.add(user, newProfile);
  };

  public shared ({ caller }) func recordGameResult(result : GameResult) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record game results");
    };
    let results = getGameResults(caller);
    let listResults = List.fromArray<GameResult>(results);
    listResults.add(result);
    gameResults.add(caller, listResults.toArray());
    updateUserProfileAfterGame(
      caller,
      result.won,
      if (result.won) { result.payout } else { result.betAmount }
    );
  };

  // Admin functions
  public shared ({ caller }) func createPromotion(title : Text, description : Text, bonusAmount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create promotions");
    };
    let promotion = { title; description; bonusAmount };
    promotions.add(promotions.size(), promotion);
  };

  // Helper method to create initial state for a new user
  func getDefaultUserProfile() : UserProfile {
    {
      username = "";
      joinDate = Time.now();
      totalGames = 0;
      totalWon = 0;
      totalLost = 0;
      balance = 1000;
    };
  };
};
