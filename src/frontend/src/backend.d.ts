import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AlarmEvent {
    childProfileId: string;
    acknowledged: boolean;
    timestamp: Time;
}
export type Time = bigint;
export interface BiometricRecord {
    id: bigint;
    data: Uint8Array;
    childId: string;
    dataType: string;
    timestamp: Time;
}
export interface UserProfile {
    name: string;
    role: string;
}
export interface ChildProfile {
    id: string;
    name: string;
    isArchived: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acknowledgeAlarm(): Promise<void>;
    addBiometricRecord(childId: string, dataType: string, data: Uint8Array): Promise<bigint>;
    archiveChildProfile(id: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createChildProfile(id: string, name: string): Promise<void>;
    deleteBiometricRecord(recordId: bigint): Promise<void>;
    getAlarmEvents(): Promise<Array<AlarmEvent>>;
    getBiometricRecordsForChild(childId: string): Promise<Array<BiometricRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChildProfiles(): Promise<Array<ChildProfile>>;
    getLinkedChildProfile(): Promise<ChildProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAlarmActive(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    linkPrincipalToChild(principal: Principal, childId: string): Promise<void>;
    renameChildProfile(id: string, newName: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setGuardianPin(pin: string): Promise<void>;
    triggerAlarm(): Promise<void>;
    unlinkPrincipalFromChild(principal: Principal): Promise<void>;
    verifyGuardianPin(pin: string): Promise<boolean>;
}
