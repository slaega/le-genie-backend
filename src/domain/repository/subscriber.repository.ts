export interface SubscriberRepository {
    subscribe(email: string): Promise<void>;
    unsubscribe(email: string): Promise<void>;
    findAll(): Promise<string[]>;
    exists(email: string): Promise<boolean>;
}
