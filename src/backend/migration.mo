import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  type OldActor = {
    guardianPinHash : ?Text;
    childProfiles : Map.Map<Text, {
      id : Text;
      name : Text;
      isArchived : Bool;
    }>;
    principalToChild : Map.Map<Principal, Text>;
    eventLog : Map.Map<Nat, {
      timestamp : Time.Time;
      childProfileId : Text;
      acknowledged : Bool;
    }>;
    eventCounter : Nat;
    alarmActive : Bool;
    userProfiles : Map.Map<Principal, {
      name : Text;
      role : Text;
    }>;
  };

  type NewActor = {
    guardianPinHash : ?Text;
    childProfiles : Map.Map<Text, {
      id : Text;
      name : Text;
      isArchived : Bool;
    }>;
    principalToChild : Map.Map<Principal, Text>;
    eventLog : Map.Map<Nat, {
      timestamp : Time.Time;
      childProfileId : Text;
      acknowledged : Bool;
    }>;
    eventCounter : Nat;
    alarmActive : Bool;
    userProfiles : Map.Map<Principal, {
      name : Text;
      role : Text;
    }>;
    biometricRecords : Map.Map<Nat, {
      id : Nat;
      childId : Text;
      dataType : Text;
      data : [Nat8];
      timestamp : Time.Time;
    }>;
    biometricRecordCounter : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      biometricRecords = Map.empty<Nat, {
        id : Nat;
        childId : Text;
        dataType : Text;
        data : [Nat8];
        timestamp : Time.Time;
      }>();
      biometricRecordCounter = 0;
    };
  };
};
