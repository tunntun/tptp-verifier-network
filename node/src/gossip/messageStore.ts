export class MessageStore {
  private seenMessageIds = new Set<string>();

  hasSeen(messageId: string): boolean {
    return this.seenMessageIds.has(messageId);
  }

  markSeen(messageId: string): void {
    this.seenMessageIds.add(messageId);
  }
}