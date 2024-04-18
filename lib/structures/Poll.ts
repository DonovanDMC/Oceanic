import type Message from "./Message";
import type User from "./User";
import type Client from "../Client";
import type { PollLayoutType } from "../Constants";
import type { GetPollAnswerUsersOptions, PollAnswer, PollResults, RawPoll } from "../types/channels";
import type { JSONPoll, PollQuestion } from "../types";

export default class Poll {
    allowMultiselect: boolean;
    answers: Array<PollAnswer>;
    client!: Client;
    expiry: Date;
    layoutType: PollLayoutType;
    message: Message;
    question: PollQuestion;
    results: PollResults;
    constructor(data: RawPoll, client: Client, message: Message) {
        Object.defineProperty(this, "client", {
            value:        client,
            enumerable:   false,
            writable:     false,
            configurable: false
        });
        this.allowMultiselect = data.allow_multiselect;
        this.answers = data.answers.map(a => ({
            answerID:  a.answer_id,
            pollMedia: a.poll_media
        }));
        this.expiry = new Date(data.expiry);
        this.layoutType = data.layout_type;
        this.message = message;
        this.question = data.question;
        const res = data.results || { answer_counts: [], is_finalized: false };
        this.results = {
            answerCounts: res.answer_counts.map(a => ({
                count:   a.count,
                id:      a.id,
                meVoted: a.me_voted,
                users:   []
            })),
            isFinalized: res.is_finalized
        };
        // this makes working with this much easier as a developer. We still have systems in place to insert missing answerCounts, if needs be
        for (const answer of data.answers) {
            if (!this.results.answerCounts.some(a => a.id === answer.answer_id)) {
                this.results.answerCounts.push({
                    count:   0,
                    id:      answer.answer_id,
                    meVoted: false,
                    users:   []
                });
            }
        }
    }

    /** The user that created this poll. */
    get creator(): User {
        return this.message.author;
    }

    /** End this poll now. */
    async expire(): Promise<void> {
        await this.client.rest.channels.expirePoll.call(this.client.rest.channels, this.message.channelID, this.message.id);
    }

    /**
     * Get the users that voted on a poll answer.
     * @param answerID The ID of the poll answer to get voters for.
     * @param options The options for getting the voters.
     */
    async getAnswerUsers(answerID: number, options?: GetPollAnswerUsersOptions): Promise<Array<User>> {
        return this.client.rest.channels.getPollAnswerUsers.call(this.client.rest.channels, this.message.channelID, this.message.id, answerID, options);
    }

    toJSON(): JSONPoll {
        return {
            allowMultiselect: this.allowMultiselect,
            answers:          this.answers,
            expiry:           this.expiry.toISOString(),
            layoutType:       this.layoutType,
            question:         this.question,
            results:          this.results
        };
    }
}
