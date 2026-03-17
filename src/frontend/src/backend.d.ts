import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Promotion {
    title: string;
    bonusAmount: bigint;
    description: string;
}
export type Time = bigint;
export interface GameResult {
    won: boolean;
    betAmount: bigint;
    gameType: GameType;
    outcome: string;
    payout: bigint;
}
export interface UserProfile {
    username: string;
    balance: bigint;
    joinDate: Time;
    totalLost: bigint;
    totalWon: bigint;
    totalGames: bigint;
}
export interface Transaction {
    type: string;
    timestamp: bigint;
    amount: bigint;
}
export enum GameType {
    blackjack = "blackjack",
    diceRoll = "diceRoll",
    coinFlip = "coinFlip",
    roulette = "roulette"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPromotion(title: string, description: string, bonusAmount: bigint): Promise<void>;
    deposit(amount: bigint): Promise<void>;
    getAllPromotions(): Promise<Array<Promotion>>;
    getBalance(): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTransactionHistory(): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile>;
    isCallerAdmin(): Promise<boolean>;
    recordGameResult(result: GameResult): Promise<void>;
    registerUser(username: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    withdraw(amount: bigint): Promise<void>;
}
