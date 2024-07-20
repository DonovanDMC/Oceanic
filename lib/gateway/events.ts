import type { DispatchEventMap } from "./Dispatcher";
import type Shard from "./Shard";
import { ChannelTypes } from "../Constants";
import type { PresenceUpdate } from "../types/gateway";
import Member from "../structures/Member";
import AutoModerationRule from "../structures/AutoModerationRule";
import Channel from "../structures/Channel";
import type {
    AnyGuildChannelWithoutThreads,
    AnyTextableChannel,
    AnyThreadChannel,
    AnyInviteChannel,
    PossiblyUncachedInvite,
    RawMessage,
    ThreadMember,
    ThreadParentChannel,
    UncachedThreadMember,
    AnyVoiceChannel,
    PollAnswer,
    AnyGuildChannel
} from "../types/channels";
import type { JSONAnnouncementThreadChannel } from "../types/json";
import VoiceChannel from "../structures/VoiceChannel";
import StageChannel from "../structures/StageChannel";
import GuildScheduledEvent from "../structures/GuildScheduledEvent";
import Invite from "../structures/Invite";
import Message from "../structures/Message";
import StageInstance from "../structures/StageInstance";
import type AnnouncementThreadChannel from "../structures/AnnouncementThreadChannel";
import Interaction from "../structures/Interaction";
import Guild from "../structures/Guild";
import Role from "../structures/Role";
import Integration from "../structures/Integration";
import VoiceState from "../structures/VoiceState";
import AuditLogEntry from "../structures/AuditLogEntry";
import type User from "../structures/User";

export async function APPLICATION_COMMAND_PERMISSIONS_UPDATE(data: DispatchEventMap["APPLICATION_COMMAND_PERMISSIONS_UPDATE"], shard: Shard): Promise<void> {
    shard.client.emit("applicationCommandPermissionsUpdate", shard.client.guilds.get(data.guild_id) ?? { id: data.guild_id }, {
        application:   data.application_id === shard.client.application.id ? shard.client.application : undefined,
        applicationID: data.application_id,
        id:            data.id,
        permissions:   data.permissions
    });
}

export async function AUTO_MODERATION_ACTION_EXECUTION(data: DispatchEventMap["AUTO_MODERATION_ACTION_EXECUTION"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const channel = shard.client.getChannel(data.channel_id ?? "");
    shard.client.emit(
        "autoModerationActionExecution",
        guild ?? { id: data.guild_id },
        data.channel_id === undefined ? null : channel ?? { id: data.channel_id },
        shard.client.users.get(data.user_id) ?? { id: data.user_id },
        {
            action: {
                metadata: {
                    channelID:       data.action.metadata.channel_id,
                    customMessage:   data.action.metadata.custom_message,
                    durationSeconds: data.action.metadata.duration_seconds
                },
                type: data.action.type
            },
            alertSystemMessageID: data.alert_system_message_id,
            content:              data.content,
            matchedContent:       data.matched_content,
            matchedKeyword:       data.matched_keyword,
            messageID:            data.message_id,
            rule:                 guild?.autoModerationRules.get(data.rule_id),
            ruleID:               data.rule_id,
            ruleTriggerType:      data.rule_trigger_type
        }
    );
}

export async function AUTO_MODERATION_RULE_CREATE(data: DispatchEventMap["AUTO_MODERATION_RULE_CREATE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const rule = guild?.autoModerationRules.update(data) ?? new AutoModerationRule(data, shard.client);
    shard.client.emit("autoModerationRuleCreate", rule);
}

export async function AUTO_MODERATION_RULE_DELETE(data: DispatchEventMap["AUTO_MODERATION_RULE_DELETE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const rule = guild?.autoModerationRules.update(data) ?? new AutoModerationRule(data, shard.client);
    guild?.autoModerationRules.delete(data.id);
    shard.client.emit("autoModerationRuleDelete", rule);
}

export async function AUTO_MODERATION_RULE_UPDATE(data: DispatchEventMap["AUTO_MODERATION_RULE_UPDATE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const oldRule = guild?.autoModerationRules.get(data.id)?.toJSON() ?? null;
    const rule = guild?.autoModerationRules.update(data) ?? new AutoModerationRule(data, shard.client);
    shard.client.emit("autoModerationRuleUpdate", rule, oldRule);
    shard.client.emit("autoModerationRuleUpdate", rule, oldRule);
}

export async function CHANNEL_CREATE(data: DispatchEventMap["CHANNEL_CREATE"], shard: Shard): Promise<void> {
    const channel = shard.client.util.updateChannel<AnyGuildChannelWithoutThreads>(data);
    shard.client.emit("channelCreate", channel);
}

export async function CHANNEL_DELETE(data: DispatchEventMap["CHANNEL_DELETE"], shard: Shard): Promise<void> {
    if (data.type === ChannelTypes.DM) {
        const channel = shard.client.privateChannels.get(data.id);
        shard.client.privateChannels.delete(data.id);
        shard.client.emit("channelDelete", channel ?? {
            id:            data.id,
            flags:         data.flags,
            lastMessageID: data.last_message_id,
            type:          data.type
        });
        return;
    }
    const guild = shard.client.guilds.get(data.guild_id);
    const channel = shard.client.util.updateChannel<AnyGuildChannelWithoutThreads>(data);
    if (channel instanceof VoiceChannel || channel instanceof StageChannel) {
        for (const [,member] of channel.voiceMembers) {
            channel.voiceMembers.delete(member.id);
            shard.client.emit("voiceChannelLeave", member, channel);
        }
    }
    guild?.channels.delete(data.id);
    shard.client.emit("channelDelete", channel);
}

export async function CHANNEL_PINS_UPDATE(data: DispatchEventMap["CHANNEL_PINS_UPDATE"], shard: Shard): Promise<void> {
    const channel = shard.client.getChannel<AnyTextableChannel>(data.channel_id);
    shard.client.emit("channelPinsUpdate", channel ?? { id: data.channel_id }, data.last_pin_timestamp === undefined || data.last_pin_timestamp === null ? null : new Date(data.last_pin_timestamp));
}

export async function CHANNEL_UPDATE(data: DispatchEventMap["CHANNEL_UPDATE"], shard: Shard): Promise<void> {
    const oldChannel = shard.client.getChannel<AnyGuildChannel>(data.id)?.toJSON() ?? null;
    let channel: AnyGuildChannel;
    if (oldChannel && oldChannel.type !== data.type) {
        if (shard.client.channelGuildMap[data.id]) {
            shard.client.guilds.get(shard.client.channelGuildMap[data.id])!.channels.delete(data.id);
        }

        channel = shard.client.util.updateChannel(data);
    } else {
        channel = shard.client.util.updateChannel(data);
    }
    shard.client.emit("channelUpdate", channel, oldChannel);
}

export async function ENTITLEMENT_CREATE(data: DispatchEventMap["ENTITLEMENT_CREATE"], shard: Shard): Promise<void> {
    const entitlement = shard.client.util.updateEntitlement(data);
    shard.client.emit("entitlementCreate", entitlement);
}

export async function ENTITLEMENT_DELETE(data: DispatchEventMap["ENTITLEMENT_DELETE"], shard: Shard): Promise<void> {
    const entitlement = shard.client.util.updateEntitlement(data);
    shard.client["_application"]?.entitlements.delete(data.id);
    shard.client.emit("entitlementDelete", entitlement);
}

export async function ENTITLEMENT_UPDATE(data: DispatchEventMap["ENTITLEMENT_UPDATE"], shard: Shard): Promise<void> {
    const oldEntitlement = shard.client["_application"]?.entitlements.get(data.id)?.toJSON() ?? null;
    const entitlement = shard.client.util.updateEntitlement(data);
    shard.client.emit("entitlementUpdate", entitlement, oldEntitlement);
}

export async function GUILD_AUDIT_LOG_ENTRY_CREATE(data: DispatchEventMap["GUILD_AUDIT_LOG_ENTRY_CREATE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    shard.client.emit("guildAuditLogEntryCreate", guild ?? { id: data.guild_id }, guild?.auditLogEntries.update(data) ?? new AuditLogEntry(data, shard.client));
}

export async function GUILD_BAN_ADD(data: DispatchEventMap["GUILD_BAN_ADD"], shard: Shard): Promise<void> {
    shard.client.emit("guildBanAdd", shard.client.guilds.get(data.guild_id) ?? { id: data.guild_id }, shard.client.users.update(data.user));
}

export async function GUILD_BAN_REMOVE(data: DispatchEventMap["GUILD_BAN_REMOVE"], shard: Shard): Promise<void> {
    shard.client.emit("guildBanRemove", shard.client.guilds.get(data.guild_id) ?? { id: data.guild_id }, shard.client.users.update(data.user));
}

export async function GUILD_CREATE(data: DispatchEventMap["GUILD_CREATE"], shard: Shard): Promise<void> {

    if (data.unavailable) {
        shard.client.guilds.delete(data.id);
        shard.client.emit("unavailableGuildCreate", shard.client.unavailableGuilds.update(data));
    } else {
        const guild = shard["createGuild"](data);
        if (shard.ready) {
            if (shard.client.unavailableGuilds.delete(guild.id)) {
                shard.client.emit("guildAvailable", guild);
            } else {
                shard.client.emit("guildCreate", guild);
            }
        } else {
            if (shard.client.unavailableGuilds.delete(guild.id)) {
                void shard["restartGuildCreateTimeout"]();
            } else {
                shard.client.emit("guildCreate", guild);
            }
        }
    }
}

export async function GUILD_DELETE(data: DispatchEventMap["GUILD_DELETE"], shard: Shard): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    shard.client.voiceAdapters.get(data.id)?.destroy();
    delete shard.client.guildShardMap[data.id];
    const guild = shard.client.guilds.get(data.id);
    guild?.channels.clear();
    guild?.threads.clear();
    shard.client.guilds.delete(data.id);
    if (data.unavailable) {
        shard.client.emit("guildUnavailable", shard.client.unavailableGuilds.update(data));
    } else {
        shard.client.emit("guildDelete", guild ?? { id: data.id });
    }
}

export async function GUILD_EMOJIS_UPDATE(data: DispatchEventMap["GUILD_EMOJIS_UPDATE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const oldEmojis = guild?.emojis ? guild.emojis.toArray() : null;
    // eslint-disable-next-line @typescript-eslint/dot-notation
    guild?.["update"]({ emojis: data.emojis });
    shard.client.emit(
        "guildEmojisUpdate",
        guild ?? { id: data.guild_id },
        guild?.emojis?.toArray() ?? data.emojis.map(emoji => shard.client.util.convertGuildEmoji(emoji)),
        oldEmojis
    );
}

export async function GUILD_INTEGRATIONS_UPDATE(data: DispatchEventMap["GUILD_INTEGRATIONS_UPDATE"], shard: Shard): Promise<void> {
    shard.client.emit("guildIntegrationsUpdate", shard.client.guilds.get(data.guild_id) ?? { id: data.guild_id });
}

export async function GUILD_MEMBER_ADD(data: DispatchEventMap["GUILD_MEMBER_ADD"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    if (guild) {
        guild.memberCount++;
    }
    const member = shard.client.util.updateMember(data.guild_id, data.user!.id, data);
    shard.client.emit("guildMemberAdd", member);
}

export async function GUILD_MEMBERS_CHUNK(data: DispatchEventMap["GUILD_MEMBERS_CHUNK"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    // eslint-disable-next-line @typescript-eslint/dot-notation
    guild?.["updateMemberLimit"](data.members.length);
    const members = data.members.map(member => shard.client.util.updateMember(data.guild_id, member.user!.id, member));
    if (data.presences) for (const presence of data.presences) {
        const member = members.find(m => m.id === presence.user.id)!;
        member.presence = {
            clientStatus: presence.client_status,
            guildID:      presence.guild_id,
            status:       presence.status,
            activities:   presence.activities?.map(activity => ({
                createdAt:     activity.created_at,
                name:          activity.name,
                type:          activity.type,
                applicationID: activity.application_id,
                assets:        activity.assets ? {
                    largeImage: activity.assets.large_image,
                    largeText:  activity.assets.large_text,
                    smallImage: activity.assets.small_image,
                    smallText:  activity.assets.small_text
                } : undefined,
                buttons:    activity.buttons,
                details:    activity.details,
                emoji:      activity.emoji,
                flags:      activity.flags,
                instance:   activity.instance,
                party:      activity.party,
                secrets:    activity.secrets,
                state:      activity.state,
                timestamps: activity.timestamps,
                url:        activity.url
            }))
        };
    }
    if (!data.nonce) {
        shard.client.emit("warn", "Received GUILD_MEMBERS_CHUNK without a nonce.");
        return;
    }
    if (shard["_requestMembersPromise"][data.nonce]) {
        shard["_requestMembersPromise"][data.nonce].members.push(...members);
    }

    if (data.chunk_index >= data.chunk_count - 1) {
        if (shard["_requestMembersPromise"][data.nonce]) {
            clearTimeout(shard["_requestMembersPromise"][data.nonce].timeout);
            shard["_requestMembersPromise"][data.nonce].resolve(shard["_requestMembersPromise"][data.nonce].members);
            delete shard["_requestMembersPromise"][data.nonce];
        }
        if (shard["_getAllUsersCount"][data.guild_id]) {
            delete shard["_getAllUsersCount"][data.guild_id];
            void shard["checkReady"]();
        }
    }

    shard.client.emit("guildMemberChunk", members);
    shard.lastHeartbeatAck = true;
}

export async function GUILD_MEMBER_REMOVE(data: DispatchEventMap["GUILD_MEMBER_REMOVE"], shard: Shard): Promise<void> {
    if (data.user.id === shard.client.user.id) {
        return;
    }
    const guild = shard.client.guilds.get(data.guild_id);
    // eslint-disable-next-line @typescript-eslint/dot-notation
    let user: Member | User | undefined = guild?.members.get(data.user.id);
    if (user instanceof Member) {
        user["update"]({ user: data.user });
    } else {
        user = shard.client.users.update(data.user);
    }
    if (guild) {
        guild.memberCount--;
        guild.members.delete(data.user.id);
    }
    shard.client.emit("guildMemberRemove", user, guild ?? { id: data.guild_id });
}

export async function GUILD_MEMBER_UPDATE(data: DispatchEventMap["GUILD_MEMBER_UPDATE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const oldMember = guild?.members.get(data.user.id)?.toJSON() ?? null;
    const member = shard.client.util.updateMember(data.guild_id, data.user.id, {  deaf: oldMember?.deaf ?? false, mute: oldMember?.mute ?? false, ...data });
    shard.client.emit("guildMemberUpdate", member, oldMember);
}

export async function GUILD_ROLE_CREATE(data: DispatchEventMap["GUILD_ROLE_CREATE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const role = guild?.roles.update(data.role, data.guild_id) ?? new Role(data.role, shard.client, data.guild_id);
    shard.client.emit("guildRoleCreate", role);
}

export async function GUILD_ROLE_DELETE(data: DispatchEventMap["GUILD_ROLE_DELETE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const role = guild?.roles.get(data.role_id);
    guild?.roles.delete(data.role_id);
    shard.client.emit("guildRoleDelete", role ?? { id: data.role_id }, guild ?? { id: data.guild_id });
}

export async function GUILD_ROLE_UPDATE(data: DispatchEventMap["GUILD_ROLE_UPDATE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const oldRole = guild?.roles.get(data.role.id)?.toJSON() ?? null;
    const role = guild?.roles.update(data.role, data.guild_id) ?? new Role(data.role, shard.client, data.guild_id);
    shard.client.emit("guildRoleUpdate", role, oldRole);
}

export async function GUILD_SCHEDULED_EVENT_CREATE(data: DispatchEventMap["GUILD_SCHEDULED_EVENT_CREATE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const event = guild?.scheduledEvents.update(data) ?? new GuildScheduledEvent(data, shard.client);
    shard.client.emit("guildScheduledEventCreate", event);
}

export async function GUILD_SCHEDULED_EVENT_DELETE(data: DispatchEventMap["GUILD_SCHEDULED_EVENT_DELETE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const event = guild?.scheduledEvents.update(data) ?? new GuildScheduledEvent(data, shard.client);
    guild?.scheduledEvents.delete(data.id);
    shard.client.emit("guildScheduledEventDelete", event);
}

export async function GUILD_SCHEDULED_EVENT_UPDATE(data: DispatchEventMap["GUILD_SCHEDULED_EVENT_UPDATE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id)!;
    const oldEvent = guild?.scheduledEvents.get(data.id)?.toJSON() ?? null;
    const event = guild?.scheduledEvents.update(data) ?? new GuildScheduledEvent(data, shard.client);
    shard.client.emit("guildScheduledEventUpdate", event, oldEvent);
}

export async function GUILD_SCHEDULED_EVENT_USER_ADD(data: DispatchEventMap["GUILD_SCHEDULED_EVENT_USER_ADD"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const event = guild?.scheduledEvents.get(data.guild_scheduled_event_id);
    if (event?.userCount) {
        event.userCount++;
    }
    const user = shard.client.users.get(data.user_id) ?? { id: data.user_id };
    shard.client.emit("guildScheduledEventUserAdd", event ?? { id: data.guild_scheduled_event_id }, user ?? { id: data.user_id });
}

export async function GUILD_SCHEDULED_EVENT_USER_REMOVE(data: DispatchEventMap["GUILD_SCHEDULED_EVENT_USER_REMOVE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const event = guild?.scheduledEvents.get(data.guild_scheduled_event_id);
    if (event?.userCount) {
        event.userCount--;
    }
    const user = shard.client.users.get(data.user_id) ?? { id: data.user_id };
    shard.client.emit("guildScheduledEventUserRemove", event ?? { id: data.guild_scheduled_event_id }, user ?? { id: data.user_id });
}

export async function GUILD_STICKERS_UPDATE(data: DispatchEventMap["GUILD_STICKERS_UPDATE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const oldStickers = guild?.stickers ? guild.stickers.toArray() : null;
    // eslint-disable-next-line @typescript-eslint/dot-notation
    guild?.["update"]({ stickers: data.stickers });
    shard.client.emit("guildStickersUpdate", guild ?? { id: data.guild_id }, guild?.stickers?.toArray() ?? data.stickers.map(sticker => shard.client.util.convertSticker(sticker)), oldStickers);
}

export async function GUILD_UPDATE(data: DispatchEventMap["GUILD_UPDATE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.id);
    const oldGuild = guild?.toJSON() ?? null;
    shard.client.emit("guildUpdate", shard.client.guilds.update(data), oldGuild);
}

export async function INTEGRATION_CREATE(data: DispatchEventMap["INTEGRATION_CREATE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const integration = guild?.integrations.update(data, data.guild_id) ?? new Integration(data, shard.client, data.guild_id);
    shard.client.emit("integrationCreate", guild ?? { id: data.guild_id }, integration);
}

export async function INTEGRATION_DELETE(data: DispatchEventMap["INTEGRATION_DELETE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const integration = guild?.integrations.get(data.id);
    guild?.integrations.delete(data.id);
    shard.client.emit("integrationDelete", guild ?? { id: data.guild_id }, integration ?? { applicationID: data.application_id, id: data.id });
}

export async function INTEGRATION_UPDATE(data: DispatchEventMap["INTEGRATION_UPDATE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const oldIntegration = guild?.integrations.get(data.id)?.toJSON() ?? null;
    const integration = guild?.integrations.update(data, data.guild_id) ?? new Integration(data, shard.client, data.guild_id);
    shard.client.emit("integrationUpdate", guild ?? { id: data.guild_id }, integration, oldIntegration);
}

export async function INTERACTION_CREATE(data: DispatchEventMap["INTERACTION_CREATE"], shard: Shard): Promise<void> {
    shard.client.emit("interactionCreate", Interaction.from(data, shard.client));
}

export async function INVITE_CREATE(data: DispatchEventMap["INVITE_CREATE"], shard: Shard): Promise<void> {
    let invite: Invite | undefined;
    if (data.guild_id) {
        const guild = shard.client.guilds.get(data.guild_id);
        invite = guild?.invites.update(data);
    }
    shard.client.emit("inviteCreate", invite ?? new Invite(data, shard.client));
}

export async function INVITE_DELETE(data: DispatchEventMap["INVITE_DELETE"], shard: Shard): Promise<void> {
    const channel = shard.client.getChannel<AnyInviteChannel>(data.channel_id) ?? { id: data.channel_id };
    const guild = data.guild_id ? shard.client.guilds.get(data.guild_id) ?? { id: data.guild_id } : undefined;
    let invite: PossiblyUncachedInvite = {
        code: data.code,
        channel,
        guild
    };
    if (guild instanceof Guild && guild.invites.has(data.code)) {
        invite = guild.invites.get(data.code)!;
        guild.invites.delete(data.code);
    }
    shard.client.emit("inviteDelete", invite);
}

export async function MESSAGE_CREATE(data: DispatchEventMap["MESSAGE_CREATE"], shard: Shard): Promise<void> {
    const channel = shard.client.getChannel<AnyTextableChannel>(data.channel_id);
    const message = channel?.messages?.update(data) ?? new Message(data, shard.client);
    if (channel) {
        channel.lastMessage = message as never;
        channel.lastMessageID = message.id;
    }
    shard.client.emit("messageCreate", message);
}

export async function MESSAGE_DELETE(data: DispatchEventMap["MESSAGE_DELETE"], shard: Shard): Promise<void> {
    const channel = shard.client.getChannel<AnyTextableChannel>(data.channel_id);
    const message = channel?.messages?.get(data.id);
    if (channel) {
        channel.messages?.delete(data.id);
        if (channel.lastMessageID === data.id) {
            channel.lastMessageID = null;
            channel.lastMessage = null;
        }
    }
    shard.client.emit("messageDelete", message ?? {
        channel:   channel ?? { id: data.channel_id },
        channelID: data.channel_id,
        guild:     data.guild_id ? shard.client.guilds.get(data.guild_id) : undefined,
        guildID:   data.guild_id, id:        data.id
    });
}

export async function MESSAGE_DELETE_BULK(data: DispatchEventMap["MESSAGE_DELETE_BULK"], shard: Shard): Promise<void> {
    const channel = shard.client.getChannel<AnyTextableChannel>(data.channel_id);
    const guild = data.guild_id ? shard.client.guilds.get(data.guild_id) : undefined;
    shard.client.emit("messageDeleteBulk", data.ids.map(id => {
        const message = channel?.messages?.get(id);
        channel?.messages?.delete(id);
        return message ?? {
            channel:   channel ?? { id: data.channel_id },
            channelID: data.channel_id,
            guild,
            guildID:   data.guild_id,
            id
        };
    }));
}

export async function MESSAGE_POLL_VOTE_ADD(data: DispatchEventMap["MESSAGE_POLL_VOTE_ADD"], shard: Shard): Promise<void> {
    const user = shard.client.users.get(data.user_id) ?? { id: data.user_id };
    const channel = shard.client.getChannel<AnyTextableChannel>(data.channel_id) ?? { id: data.channel_id };
    const guild = data.guild_id ? shard.client.guilds.get(data.guild_id) : undefined;
    const message = (channel instanceof Channel ? channel.messages.get(data.message_id) : undefined) ?? { channel, channelID: channel.id, guild, guildID: guild?.id, id: data.message_id };
    let answer: PollAnswer | { answerID: number; } = { answerID: data.answer_id };
    if (message instanceof Message && message.poll !== undefined) {
        const pollAnswer = message.poll.answers.find(a => a.answerID === data.answer_id);
        if (pollAnswer) {
            answer = pollAnswer;
        }

        shard.client.util.updatePollAnswer(message.poll, data.answer_id, 1, data.user_id);
    }
    shard.client.emit("messagePollVoteAdd", message, user, answer);
}

export async function MESSAGE_POLL_VOTE_REMOVE(data: DispatchEventMap["MESSAGE_POLL_VOTE_REMOVE"], shard: Shard): Promise<void> {
    const user = shard.client.users.get(data.user_id) ?? { id: data.user_id };
    const channel = shard.client.getChannel<AnyTextableChannel>(data.channel_id) ?? { id: data.channel_id };
    const guild = data.guild_id ? shard.client.guilds.get(data.guild_id) : undefined;
    const message = (channel instanceof Channel ? channel.messages.get(data.message_id) : undefined) ?? { channel, channelID: channel.id, guild, guildID: guild?.id, id: data.message_id };
    let answer: PollAnswer | { answerID: number; } = { answerID: data.answer_id };
    if (message instanceof Message && message.poll !== undefined) {
        const pollAnswer = message.poll.answers.find(a => a.answerID === data.answer_id);
        if (pollAnswer) {
            answer = pollAnswer;
        }

        shard.client.util.updatePollAnswer(message.poll, data.answer_id, -1, data.user_id);
    }
    shard.client.emit("messagePollVoteRemove", message, user, answer);
}

export async function MESSAGE_REACTION_ADD(data: DispatchEventMap["MESSAGE_REACTION_ADD"], shard: Shard): Promise<void> {
    const channel = shard.client.getChannel<AnyTextableChannel>(data.channel_id);
    const guild = data.guild_id ? shard.client.guilds.get(data.guild_id) : undefined;
    const message = channel?.messages?.get(data.message_id);
    const reactor = data.member
        ? (data.guild_id ? shard.client.util.updateMember(data.guild_id, data.user_id, data.member) : shard.client.users.get(data.user_id) ?? { id: data.user_id })
        : shard.client.users.get(data.user_id) ?? { id: data.user_id };

    if (message) {
        const index = message.reactions.findIndex(r => r.emoji.id === data.emoji.id && r.emoji.name === data.emoji.name);
        if (index === -1) {
            message.reactions.push({
                burstColors:  data.burst_colors,
                count:        1,
                countDetails: {
                    burst:  data.burst ? 1 : 0,
                    normal: data.burst ? 0 : 1
                },
                emoji:   data.emoji,
                me:      data.user_id === shard.client.user.id,
                meBurst: data.user_id === shard.client.user.id && data.burst
            });
        } else {
            if (data.burst) {
                message.reactions[index].countDetails.burst++;
            } else {
                message.reactions[index].countDetails.normal++;
            }
            message.reactions[index].count++;
            if (data.user_id === shard.client.user.id) {
                message.reactions[index].me = true;
            }
        }

    }

    shard.client.emit("messageReactionAdd", message ?? {
        channel:   channel ?? { id: data.channel_id },
        channelID: data.channel_id,
        guild,
        guildID:   data.guild_id,
        id:        data.message_id ,
        author:    data.message_author_id === undefined ? undefined : shard.client.users.get(data.message_author_id) ?? { id: data.message_author_id },
        member:    data.message_author_id === undefined ? undefined : guild?.members.get(data.message_author_id) ?? { id: data.message_author_id }
    }, reactor, {
        burst:       data.burst,
        burstColors: data.burst_colors,
        emoji:       data.emoji,
        type:        data.type
    });
}

export async function MESSAGE_REACTION_REMOVE(data: DispatchEventMap["MESSAGE_REACTION_REMOVE"], shard: Shard): Promise<void> {
    const channel = shard.client.getChannel<AnyTextableChannel>(data.channel_id);
    const message = channel?.messages?.get(data.message_id);
    const reactor = shard.client.users.get(data.user_id) ?? { id: data.user_id };

    if (message) {
        const index = message.reactions.findIndex(r => r.emoji.id === data.emoji.id && r.emoji.name === data.emoji.name);
        if (index !== -1) {
            if (data.burst) {
                message.reactions[index].countDetails.burst--;
            } else {
                message.reactions[index].countDetails.normal--;
            }
            message.reactions[index].count--;
            if (data.user_id === shard.client.user.id) {
                if (data.burst) {
                    message.reactions[index].meBurst = false;
                } else {
                    message.reactions[index].me = false;
                }
            }
            if (message.reactions[index].count === 0) {
                message.reactions.splice(index, 1);
            }
        }
    }

    shard.client.emit("messageReactionRemove", message ?? {
        channel:   channel ?? { id: data.channel_id },
        channelID: data.channel_id,
        guild:     data.guild_id ? shard.client.guilds.get(data.guild_id) : undefined,
        guildID:   data.guild_id,
        id:        data.message_id
    }, reactor, {
        burst:       data.burst,
        burstColors: data.burst_colors,
        emoji:       data.emoji,
        type:        data.type
    });
}

export async function MESSAGE_REACTION_REMOVE_ALL(data: DispatchEventMap["MESSAGE_REACTION_REMOVE_ALL"], shard: Shard): Promise<void> {
    const channel = shard.client.getChannel<AnyTextableChannel>(data.channel_id);
    const message = channel?.messages?.get(data.message_id);

    if (message) {
        message.reactions = [];
    }

    shard.client.emit("messageReactionRemoveAll", message ?? {
        channel:   channel ?? { id: data.channel_id },
        channelID: data.channel_id,
        guild:     data.guild_id ? shard.client.guilds.get(data.guild_id) : undefined,
        guildID:   data.guild_id,
        id:        data.message_id
    });
}

export async function MESSAGE_REACTION_REMOVE_EMOJI(data: DispatchEventMap["MESSAGE_REACTION_REMOVE_EMOJI"], shard: Shard): Promise<void> {
    const channel = shard.client.getChannel<AnyTextableChannel>(data.channel_id);
    const message = channel?.messages?.get(data.message_id);

    if (message) {
        const index = message.reactions.findIndex(r => r.emoji.id === data.emoji.id && r.emoji.name === data.emoji.name);
        if (index !== -1) {
            message.reactions.splice(index, 1);
        }
    }

    shard.client.emit("messageReactionRemoveEmoji", message ?? {
        channel:   channel ?? { id: data.channel_id },
        channelID: data.channel_id,
        guild:     data.guild_id ? shard.client.guilds.get(data.guild_id) : undefined,
        guildID:   data.guild_id,
        id:        data.message_id
    }, data.emoji);
}

export async function MESSAGE_UPDATE(data: DispatchEventMap["MESSAGE_UPDATE"], shard: Shard): Promise<void> {
    const channel = shard.client.getChannel<AnyTextableChannel>(data.channel_id);
    const oldMessage = channel?.messages?.get(data.id)?.toJSON() ?? null;
    if (!oldMessage && !data.author) {
        shard.client.emit("debug", `Got partial MESSAGE_UPDATE for uncached message ${data.id} for channel ${data.channel_id}, discarding..`);
        return;
    }
    const message = channel?.messages?.update(data) ?? new Message(data as RawMessage, shard.client);
    shard.client.emit("messageUpdate", message, oldMessage);
}

export async function PRESENCE_UPDATE(data: DispatchEventMap["PRESENCE_UPDATE"], shard: Shard): Promise<void> {
    const user = shard.client.users.get(data.user.id);
    if (user) {
        const oldUser = user.toJSON();
        user["update"](data.user);
        if (JSON.stringify(oldUser) !== JSON.stringify(user.toJSON())) {
            shard.client.emit("userUpdate", user, oldUser);
        }
    }

    const guild = shard.client.guilds.get(data.guild_id);
    const member = guild?.members.get(data.user.id);
    const oldPresence = member?.presence ?? null;

    const presence = {
        clientStatus: data.client_status,
        guildID:      data.guild_id,
        status:       data.status,
        activities:   data.activities?.map(activity => ({
            createdAt:     activity.created_at,
            name:          activity.name,
            type:          activity.type,
            applicationID: activity.application_id,
            assets:        activity.assets ? {
                largeImage: activity.assets.large_image,
                largeText:  activity.assets.large_text,
                smallImage: activity.assets.small_image,
                smallText:  activity.assets.small_text
            } : undefined,
            buttons:    activity.buttons,
            details:    activity.details,
            emoji:      activity.emoji,
            flags:      activity.flags,
            instance:   activity.instance,
            party:      activity.party,
            secrets:    activity.secrets,
            state:      activity.state,
            timestamps: activity.timestamps,
            url:        activity.url
        }))
    };
    const userID = data.user.id;

    delete (data as { user?: PresenceUpdate["user"]; }).user;
    if (member) {
        member.presence = presence;
    }

    shard.client.emit("presenceUpdate", guild ?? { id: data.guild_id }, member ?? { id: userID }, presence, oldPresence);
}

export async function READY(data: DispatchEventMap["READY"], shard: Shard): Promise<void> {
    shard["_ready"](data);
}

export async function RESUMED(data: DispatchEventMap["RESUMED"], shard: Shard): Promise<void> {
    shard["_resume"]();
}

export async function STAGE_INSTANCE_CREATE(data: DispatchEventMap["STAGE_INSTANCE_CREATE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const stateInstance = guild?.stageInstances.update(data) ?? new StageInstance(data, shard.client);
    shard.client.emit("stageInstanceCreate", stateInstance);
}

export async function STAGE_INSTANCE_DELETE(data: DispatchEventMap["STAGE_INSTANCE_DELETE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const stateInstance = guild?.stageInstances.update(data) ?? new StageInstance(data, shard.client);
    guild?.stageInstances.delete(data.id);
    shard.client.emit("stageInstanceDelete", stateInstance);
}

export async function STAGE_INSTANCE_UPDATE(data: DispatchEventMap["STAGE_INSTANCE_UPDATE"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    const oldStageInstance = guild?.stageInstances.get(data.id)?.toJSON() ?? null;
    const stateInstance = guild?.stageInstances.update(data) ?? new StageInstance(data, shard.client);
    shard.client.emit("stageInstanceUpdate", stateInstance, oldStageInstance);
}

export async function THREAD_CREATE(data: DispatchEventMap["THREAD_CREATE"], shard: Shard): Promise<void> {
    const thread = shard.client.util.updateThread(data);
    const channel = shard.client.getChannel<ThreadParentChannel>(data.parent_id!);
    if (channel && channel.type === ChannelTypes.GUILD_FORUM) {
        channel.lastThreadID = thread.id;
    }
    shard.client.emit("threadCreate", thread);
}

export async function THREAD_DELETE(data: DispatchEventMap["THREAD_DELETE"], shard: Shard): Promise<void> {
    const channel = shard.client.getChannel<ThreadParentChannel>(data.parent_id!);
    const thread = shard.client.getChannel<AnyThreadChannel>(data.id) ?? {
        id:       data.id,
        guild:    shard.client.guilds.get(data.guild_id),
        guildID:  data.guild_id,
        parent:   channel || { id: data.parent_id! },
        parentID: data.parent_id!,
        type:     data.type
    };
    if (channel && channel.type === ChannelTypes.GUILD_FORUM && channel.lastThreadID === data.id) {
        channel.lastThreadID = null;
    }
    shard.client.guilds.get(data.guild_id)?.threads.delete(data.id);
    shard.client.emit("threadDelete", thread);
}

export async function THREAD_LIST_SYNC(data: DispatchEventMap["THREAD_LIST_SYNC"], shard: Shard): Promise<void> {
    const guild = shard.client.guilds.get(data.guild_id);
    if (!guild) {
        shard.client.emit("debug", `Missing guild in THREAD_LIST_SYNC: ${data.guild_id}`);
        return;
    }
    for (const threadData of data.threads) {
        shard.client.util.updateThread(threadData);
    }
    for (const member of data.members) {
        const thread = shard.client.getChannel<AnyThreadChannel>(member.id);
        if (thread) {
            const threadMember: ThreadMember = {
                id:            member.id,
                flags:         member.flags,
                joinTimestamp: new Date(member.join_timestamp),
                userID:        member.user_id
            };
            const index = thread.members.findIndex(m => m.userID === member.user_id);
            if (index === -1) {
                thread.members.push(threadMember);
            } else {
                thread.members[index] = threadMember;
            }
        }
    }
}

export async function THREAD_MEMBER_UPDATE(data: DispatchEventMap["THREAD_MEMBER_UPDATE"], shard: Shard): Promise<void> {
    const thread = shard.client.getChannel<AnyThreadChannel>(data.id);
    const guild = shard.client.guilds.get(data.guild_id);
    const threadMember: ThreadMember = {
        id:            data.id,
        flags:         data.flags,
        joinTimestamp: new Date(data.join_timestamp),
        userID:        data.user_id
    };
    let oldThreadMember: ThreadMember | null = null;
    if (thread) {
        const index = thread.members.findIndex(m => m.userID === data.user_id);
        if (index === -1) {
            thread.members.push(threadMember);
        } else {
            oldThreadMember = { ...thread.members[index] };
            thread.members[index] = threadMember;
        }
    }

    shard.client.emit(
        "threadMemberUpdate",
        thread ?? {
            id:      data.id,
            guild,
            guildID: data.guild_id
        },
        threadMember,
        oldThreadMember
    );
}

export async function THREAD_MEMBERS_UPDATE(data: DispatchEventMap["THREAD_MEMBERS_UPDATE"], shard: Shard): Promise<void> {
    const thread = shard.client.getChannel<AnyThreadChannel>(data.id);
    const guild = shard.client.guilds.get(data.guild_id);
    const addedMembers: Array<ThreadMember> = (data.added_members ?? []).map(rawMember => ({
        flags:         rawMember.flags,
        id:            rawMember.id,
        joinTimestamp: new Date(rawMember.join_timestamp),
        userID:        rawMember.user_id
    }));
    const removedMembers: Array<ThreadMember | UncachedThreadMember> = (data.removed_member_ids ?? []).map(id => ({ userID: id, id: data.id }));
    if (thread) {
        thread.memberCount = data.member_count;
        for (const rawMember of addedMembers) {
            const index = thread.members.findIndex(m => m.userID === rawMember.id);
            if (index === -1) {
                thread.members.push(rawMember);
            } else {
                thread.members[index] = rawMember;
            }
        }
        for (const [index, { userID }] of removedMembers.entries()) {
            const memberIndex = thread.members.findIndex(m => m.userID === userID);
            if (memberIndex >= 0) {
                removedMembers[index] = thread.members[memberIndex];
                thread.members.splice(memberIndex, 1);
            }
        }
    }
    shard.client.emit(
        "threadMembersUpdate",
        thread ?? {
            id:      data.id,
            guild,
            guildID: data.guild_id
        },
        addedMembers,
        removedMembers
    );
}

export async function THREAD_UPDATE(data: DispatchEventMap["THREAD_UPDATE"], shard: Shard): Promise<void> {
    const oldThread = shard.client.getChannel<AnyThreadChannel>(data.id)?.toJSON() ?? null;
    const thread = shard.client.util.updateThread(data);
    shard.client.emit("threadUpdate", thread as AnnouncementThreadChannel, oldThread as JSONAnnouncementThreadChannel);
}

export async function TYPING_START(data: DispatchEventMap["TYPING_START"], shard: Shard): Promise<void> {
    const channel = shard.client.getChannel<AnyTextableChannel>(data.channel_id) ?? { id: data.channel_id };
    const startTimestamp = new Date(data.timestamp);
    if (data.member) {
        const member = shard.client.util.updateMember(data.guild_id!, data.user_id, data.member);
        shard.client.emit("typingStart", channel, member, startTimestamp);
        return;
    }
    const user = shard.client.users.get(data.user_id);
    shard.client.emit("typingStart", channel, user ?? { id: data.user_id }, startTimestamp);
}

export async function USER_UPDATE(data: DispatchEventMap["USER_UPDATE"], shard: Shard): Promise<void> {
    const oldUser = shard.client.users.get(data.id)?.toJSON() ?? null;
    shard.client.emit("userUpdate", shard.client.users.update(data), oldUser);
}

export async function VOICE_CHANNEL_EFFECT_SEND(data: DispatchEventMap["VOICE_CHANNEL_EFFECT_SEND"], shard: Shard): Promise<void> {
    const channel = shard.client.getChannel<AnyVoiceChannel>(data.channel_id);
    const guild = shard.client.guilds.get(data.guild_id);
    const user = guild?.members.get(data.user_id) ?? shard.client.users.get(data.user_id);
    shard.client.emit("voiceChannelEffectSend", channel ?? { id: data.channel_id, guild: guild ?? { id: data.guild_id } }, user ?? { id: data.user_id }, {
        animationID:   data.animation_id,
        animationType: data.animation_type
    });
}

export async function VOICE_STATE_UPDATE(data: DispatchEventMap["VOICE_STATE_UPDATE"], shard: Shard): Promise<void> {
    if (data.guild_id && data.session_id && data.user_id === shard.client.user.id) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        shard.client.voiceAdapters.get(data.guild_id)?.onVoiceStateUpdate(data as never);
    }
    // @TODO voice states without guilds?
    if (!data.guild_id || !data.member) {
        return;
    }
    data.self_stream = !!data.self_stream;
    const guild = shard.client.guilds.get(data.guild_id);
    const member = shard.client.util.updateMember(data.guild_id, data.user_id, data.member);

    const oldState = guild?.voiceStates.get(member.id)?.toJSON() ?? null;
    const state = guild?.voiceStates.update({ ...data, id: member.id }) ?? new VoiceState(data, shard.client);
    member["update"]({ deaf: state.deaf, mute: state.mute });

    if (oldState?.channelID !== state.channelID) {
        const oldChannel = oldState?.channelID ? shard.client.getChannel<VoiceChannel | StageChannel>(oldState.channelID) ?? { id: oldState.channelID } : null;
        const newChannel = state.channel === null ? null : state.channel ?? { id: state.channelID! };

        if (newChannel instanceof Channel) {
            newChannel.voiceMembers.add(member);
        }
        if (oldChannel instanceof Channel) {
            oldChannel.voiceMembers.delete(member.id);
        }
        if (oldChannel && newChannel) {
            shard.client.emit("voiceChannelSwitch", member, newChannel, oldChannel);
        } else if (newChannel) {
            shard.client.emit("voiceChannelJoin", member, newChannel);
        } else if (state.channelID === null) {
            shard.client.emit("voiceChannelLeave", member, oldChannel);
        }
    }

    if (JSON.stringify(oldState) !== JSON.stringify(state.toJSON())) {
        shard.client.emit("voiceStateUpdate", member, oldState);
    }
}

export async function VOICE_CHANNEL_STATUS_UPDATE(data: DispatchEventMap["VOICE_CHANNEL_STATUS_UPDATE"], shard: Shard): Promise<void> {
    shard.client.emit("voiceChannelStatusUpdate", shard.client.getChannel<VoiceChannel>(data.id) ?? { id: data.id }, data.status);
}

export async function VOICE_SERVER_UPDATE(data: DispatchEventMap["VOICE_SERVER_UPDATE"], shard: Shard): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    shard.client.voiceAdapters.get(data.guild_id)?.onVoiceServerUpdate(data);
}

export async function WEBHOOKS_UPDATE(data: DispatchEventMap["WEBHOOKS_UPDATE"], shard: Shard): Promise<void> {
    shard.client.emit("webhooksUpdate", shard.client.guilds.get(data.guild_id) ?? { id: data.guild_id }, shard.client.getChannel<AnyGuildChannelWithoutThreads>(data.channel_id) ?? { id: data.channel_id });
}
