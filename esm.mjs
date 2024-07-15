// Channel and Interaction MUST be at the top due to circular imports
const Channel = (await import("./dist/lib/structures/Channel.js")).default.default;
const Interaction = (await import("./dist/lib/structures/Interaction.js")).default.default;
const AnnouncementChannel = (await import("./dist/lib/structures/AnnouncementChannel.js")).default.default;
const AnnouncementThreadChannel = (await import("./dist/lib/structures/AnnouncementThreadChannel.js")).default.default;
const Application = (await import("./dist/lib/structures/Application.js")).default.default;
const ApplicationCommand = (await import("./dist/lib/structures/ApplicationCommand.js")).default.default;
const Attachment = (await import("./dist/lib/structures/Attachment.js")).default.default;
const AuditLogEntry = (await import("./dist/lib/structures/AuditLogEntry.js")).default.default;
const AutocompleteInteraction = (await import("./dist/lib/structures/AutocompleteInteraction.js")).default.default;
const AutoModerationRule = (await import("./dist/lib/structures/AutoModerationRule.js")).default.default;
const Base = (await import("./dist/lib/structures/Base.js")).default.default;
const BaseEntitlement = (await import("./dist/lib/structures/BaseEntitlement.js")).default.default;
const Bucket = (await import("./dist/lib/rest/Bucket.js")).default.default;
const CategoryChannel = (await import("./dist/lib/structures/CategoryChannel.js")).default.default;
const Clan = (await import("./dist/lib/structures/Clan.js")).default.default;
const Client = (await import("./dist/lib/Client.js")).default.default;
const ClientApplication = (await import("./dist/lib/structures/ClientApplication.js")).default.default;
const Constants = (await import("./dist/lib/Constants.js")).default;
const CommandInteraction = (await import("./dist/lib/structures/CommandInteraction.js")).default.default;
const Collection = (await import("./dist/lib/util/Collection.js")).default.default;
const ComponentInteraction = (await import("./dist/lib/structures/ComponentInteraction.js")).default.default;
const DiscordHTTPError = (await import("./dist/lib/rest/DiscordHTTPError.js")).default.default;
const DiscordRESTError = (await import("./dist/lib/rest/DiscordRESTError.js")).default.default;
const Dispatcher = (await import("./dist/lib/gateway/Dispatcher.js")).default.default;
const DefaultDispatchEvents = (await import("./dist/lib/gateway/events.js")).default;
const Errors = (await import("./dist/lib/util/Errors.js")).default;
const Entitlement = (await import("./dist/lib/structures/Entitlement.js")).default.default;
const ExtendedUser = (await import("./dist/lib/structures/ExtendedUser.js")).default.default;
const ForumChannel = (await import("./dist/lib/structures/ForumChannel.js")).default.default;
const GroupChannel = (await import("./dist/lib/structures/GroupChannel.js")).default.default;
const Guild = (await import("./dist/lib/structures/Guild.js")).default.default;
const GuildChannel = (await import("./dist/lib/structures/GuildChannel.js")).default.default;
const GuildPreview = (await import("./dist/lib/structures/GuildPreview.js")).default.default;
const GuildScheduledEvent = (await import("./dist/lib/structures/GuildScheduledEvent.js")).default.default;
const GuildTemplate = (await import("./dist/lib/structures/GuildTemplate.js")).default.default;
const Integration = (await import("./dist/lib/structures/Integration.js")).default.default;
const InteractionResolvedChannel = (await import("./dist/lib/structures/InteractionResolvedChannel.js")).default.default;
const InteractionOptionsWrapper = (await import("./dist/lib/util/interactions/InteractionOptionsWrapper.js")).default.default;
const Invite = (await import("./dist/lib/structures/Invite.js")).default.default;
const InviteGuild = (await import("./dist/lib/structures/InviteGuild.js")).default.default;
const MediaChannel = (await import("./dist/lib/structures/MediaChannel.js")).default.default;
const Member = (await import("./dist/lib/structures/Member.js")).default.default;
const Message = (await import("./dist/lib/structures/Message.js")).default.default;
const MessageInteractionResponse = (await import("./dist/lib/util/interactions/MessageInteractionResponse.js")).default.default;
const ModalSubmitInteraction = (await import("./dist/lib/structures/ModalSubmitInteraction.js")).default.default;
const ModalSubmitInteractionComponentsWrapper = (await import("./dist/lib/util/interactions/ModalSubmitInteractionComponentsWrapper.js")).default.default;
const OAuthApplication = (await import("./dist/lib/structures/OAuthApplication.js")).default.default;
const OAuthGuild = (await import ("./dist/lib/structures/OAuthGuild.js")).default.default;
const OAuthHelper = (await import ("./dist/lib/rest/OAuthHelper.js")).default.default;
const PartialApplication = (await import("./dist/lib/structures/PartialApplication.js")).default.default;
const Permission = (await import("./dist/lib/structures/Permission.js")).default.default;
const PermissionOverwrite = (await import("./dist/lib/structures/PermissionOverwrite.js")).default.default;
const PingInteraction = (await import("./dist/lib/structures/PingInteraction.js")).default.default;
const Poll = (await import("./dist/lib/structures/Poll.js")).default.default;
const PrivateChannel = (await import("./dist/lib/structures/PrivateChannel.js")).default.default;
const PrivateThreadChannel = (await import("./dist/lib/structures/PrivateThreadChannel.js")).default.default;
const PublicThreadChannel = (await import("./dist/lib/structures/PublicThreadChannel.js")).default.default;
const RequestHandler = (await import("./dist/lib/rest/RequestHandler.js")).default.default;
const RESTManager = (await import("./dist/lib/rest/RESTManager.js")).default.default;
const Role = (await import("./dist/lib/structures/Role.js")).default.default;
const Routes = (await import("./dist/lib/util/Routes.js")).default;
const SelectMenuValuesWrapper = (await import ("./dist/lib/util/interactions/SelectMenuValuesWrapper.js")).default.default;
const SequentialBucket = (await import("./dist/lib/rest/SequentialBucket.js")).default.default;
const SimpleCollection = (await import("./dist/lib/util/SimpleCollection.js")).default.default;
const Shard = (await import("./dist/lib/gateway/Shard.js")).default.default;
const ShardManager = (await import("./dist/lib/gateway/ShardManager.js")).default.default;
const StageChannel = (await import("./dist/lib/structures/StageChannel.js")).default.default;
const StageInstance = (await import("./dist/lib/structures/StageInstance.js")).default.default;
const Team = (await import("./dist/lib/structures/Team.js")).default.default;
const TestEntitlement = (await import("./dist/lib/structures/TestEntitlement.js")).default.default;
const TextableChannel = (await import("./dist/lib/structures/TextableChannel.js")).default.default;
const TextableVoiceChannel = (await import("./dist/lib/structures/TextableVoiceChannel.js")).default.default;
const ThreadableChannel = (await import("./dist/lib/structures/ThreadableChannel.js")).default.default;
const ThreadChannel = (await import("./dist/lib/structures/ThreadChannel.js")).default.default;
const ThreadOnlyChannel = (await import("./dist/lib/structures/ThreadOnlyChannel.js")).default.default;
const TextChannel = (await import("./dist/lib/structures/TextChannel.js")).default.default;
const TypedCollection = (await import("./dist/lib/util/TypedCollection.js")).default.default;
const TypedEmitter = (await import("./dist/lib/util/TypedEmitter.js")).default.default;
const UnavailableGuild = (await import("./dist/lib/structures/UnavailableGuild.js")).default.default;
const User = (await import("./dist/lib/structures/User.js")).default.default;
const Util = (await import("./dist/lib/util/Util.js")).default.default;
const VoiceChannel = (await import("./dist/lib/structures/VoiceChannel.js")).default.default;
const VoiceState = (await import("./dist/lib/structures/VoiceState.js")).default.default;
const Webhook = (await import("./dist/lib/structures/Webhook.js")).default.default;

export * from "./dist/lib/Constants.js";
export * from "./dist/lib/util/Errors.js";

export {
    Channel,
    Interaction,
    AnnouncementChannel,
    AnnouncementThreadChannel,
    Application,
    ApplicationCommand,
    Attachment,
    AuditLogEntry,
    AutocompleteInteraction,
    AutoModerationRule,
    Base,
    BaseEntitlement,
    Bucket,
    CategoryChannel,
    Clan,
    Client,
    ClientApplication,
    Constants,
    CommandInteraction,
    Collection,
    ComponentInteraction,
    DiscordHTTPError,
    DiscordRESTError,
    Dispatcher,
    DefaultDispatchEvents,
    Errors,
    Entitlement,
    ExtendedUser,
    ForumChannel,
    GroupChannel,
    Guild,
    GuildChannel,
    GuildPreview,
    GuildScheduledEvent,
    GuildTemplate,
    Integration,
    InteractionResolvedChannel,
    InteractionOptionsWrapper,
    Invite,
    InviteGuild,
    MediaChannel,
    Member,
    Message,
    MessageInteractionResponse,
    ModalSubmitInteraction,
    ModalSubmitInteractionComponentsWrapper,
    OAuthApplication,
    OAuthGuild,
    OAuthHelper,
    PartialApplication,
    Permission,
    PermissionOverwrite,
    PingInteraction,
    Poll,
    PrivateChannel,
    PrivateThreadChannel,
    PublicThreadChannel,
    RequestHandler,
    RESTManager,
    Role,
    Routes,
    SelectMenuValuesWrapper,
    SequentialBucket,
    SimpleCollection,
    Shard,
    ShardManager,
    StageChannel,
    StageInstance,
    Team,
    TestEntitlement,
    TextableChannel,
    TextableVoiceChannel,
    TextChannel,
    ThreadableChannel,
    ThreadChannel,
    ThreadOnlyChannel,
    TypedCollection,
    TypedEmitter,
    UnavailableGuild,
    User,
    Util,
    VoiceChannel,
    VoiceState,
    Webhook
};
