import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Use migration function on upgrade
(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type
  public type UserProfile = {
    name : Text;
    role : Text; // "guardian" or "child"
  };

  type ChildProfile = {
    id : Text;
    name : Text;
    isArchived : Bool;
  };

  module ChildProfile {
    public func compareById(p1 : ChildProfile, p2 : ChildProfile) : Order.Order {
      Text.compare(p1.id, p2.id);
    };
  };

  type AlarmEvent = {
    timestamp : Time.Time;
    childProfileId : Text;
    acknowledged : Bool;
  };

  module AlarmEvent {
    public func compareByTimestamp(e1 : AlarmEvent, e2 : AlarmEvent) : Order.Order {
      Int.compare(e1.timestamp, e2.timestamp);
    };
  };

  type BiometricRecord = {
    id : Nat;
    childId : Text;
    dataType : Text; // "fingerprint", "face", etc.
    data : [Nat8]; // Raw encoded data
    timestamp : Time.Time;
  };

  // Persistent state
  var guardianPinHash : ?Text = null; // Stores PIN hash (placeholder for actual hash in runtime environment)
  let childProfiles = Map.empty<Text, ChildProfile>();
  let principalToChild = Map.empty<Principal, Text>();
  let eventLog = Map.empty<Nat, AlarmEvent>();
  var eventCounter : Nat = 0;
  var alarmActive : Bool = false;
  let userProfiles = Map.empty<Principal, UserProfile>();
  let biometricRecords = Map.empty<Nat, BiometricRecord>();
  var biometricRecordCounter : Nat = 0;

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  // Guardian PIN management
  public shared ({ caller }) func setGuardianPin(pin : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    guardianPinHash := ?pin;
  };

  public shared ({ caller }) func verifyGuardianPin(pin : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    switch (guardianPinHash) {
      case (null) { false };
      case (?storedHash) { storedHash == pin };
    };
  };

  // Child profile management
  public shared ({ caller }) func createChildProfile(id : Text, name : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    let newProfile : ChildProfile = {
      id;
      name;
      isArchived = false;
    };
    childProfiles.add(id, newProfile);
  };

  public shared ({ caller }) func renameChildProfile(id : Text, newName : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    switch (childProfiles.get(id)) {
      case (null) { Runtime.trap("Child profile not found") };
      case (?profile) {
        let updatedProfile = {
          profile with name = newName;
        };
        childProfiles.add(id, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func archiveChildProfile(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    switch (childProfiles.get(id)) {
      case (null) { Runtime.trap("Child profile not found") };
      case (?profile) {
        let updatedProfile = {
          profile with isArchived = true;
        };
        childProfiles.add(id, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func linkPrincipalToChild(principal : Principal, childId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    switch (childProfiles.get(childId)) {
      case (null) { Runtime.trap("Child profile not found") };
      case (?_) {
        principalToChild.add(principal, childId);
      };
    };
  };

  public shared ({ caller }) func unlinkPrincipalFromChild(principal : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    principalToChild.remove(principal);
  };

  // Alarm triggering (child access)
  public shared ({ caller }) func triggerAlarm() : async () {
    switch (principalToChild.get(caller)) {
      case (null) { Runtime.trap("No linked child profile for this principal") };
      case (?childId) {
        let event : AlarmEvent = {
          timestamp = Time.now();
          childProfileId = childId;
          acknowledged = false;
        };
        eventLog.add(eventCounter, event);
        eventCounter += 1;
        alarmActive := true;
      };
    };
  };

  // Alarm acknowledgment (guardian only)
  public shared ({ caller }) func acknowledgeAlarm() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    alarmActive := false;
    for ((key, event) in eventLog.entries()) {
      if (not event.acknowledged) {
        let updatedEvent = {
          event with acknowledged = true;
        };
        eventLog.add(key, updatedEvent);
      };
    };
  };

  // Query functions
  public query ({ caller }) func getAlarmEvents() : async [AlarmEvent] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    eventLog.values().toArray().sort(AlarmEvent.compareByTimestamp);
  };

  public query ({ caller }) func getChildProfiles() : async [ChildProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    childProfiles.values().toArray().sort(ChildProfile.compareById);
  };

  public query ({ caller }) func isAlarmActive() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check alarm status");
    };
    alarmActive;
  };

  public query ({ caller }) func getLinkedChildProfile() : async ?ChildProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check linked profile");
    };
    switch (principalToChild.get(caller)) {
      case (null) { null };
      case (?childId) { childProfiles.get(childId) };
    };
  };

  // NEW: Biometric record management
  public shared ({ caller }) func addBiometricRecord(childId : Text, dataType : Text, data : [Nat8]) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Guardian only");
    };

    let record : BiometricRecord = {
      id = biometricRecordCounter;
      childId;
      dataType;
      data;
      timestamp = Time.now();
    };

    biometricRecords.add(biometricRecordCounter, record);
    biometricRecordCounter += 1;
    record.id;
  };

  public query ({ caller }) func getBiometricRecordsForChild(childId : Text) : async [BiometricRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Guardian only");
    };

    biometricRecords.values().toArray().filter(
      func(record) { record.childId == childId }
    );
  };

  public shared ({ caller }) func deleteBiometricRecord(recordId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Guardian only");
    };

    let success = biometricRecords.containsKey(recordId);
    biometricRecords.remove(recordId);

    if (not success) {
      Runtime.trap("Record not found");
    };
  };
};
