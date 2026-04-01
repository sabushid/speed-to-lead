import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { env } from "@/lib/config/env";
import { logger } from "@/lib/utils/logger";
import type { Lead } from "@/lib/types/lead";

export async function createVoiceAgentRoom(leadId: string) {
  const roomName = `lead-${leadId}`;
  const roomService = new RoomServiceClient(
    env.LIVEKIT_URL(),
    env.LIVEKIT_API_KEY(),
    env.LIVEKIT_API_SECRET()
  );

  await roomService.createRoom({
    name: roomName,
    emptyTimeout: 300,
    maxParticipants: 3,
  });

  const agentToken = new AccessToken(
    env.LIVEKIT_API_KEY(),
    env.LIVEKIT_API_SECRET(),
    {
      identity: "ai-agent",
      name: "Speed-to-Lead Agent",
    }
  );
  agentToken.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  logger.info({ roomName }, "LiveKit room created");

  return {
    roomName,
    token: await agentToken.toJwt(),
  };
}

export async function dispatchAgent(roomName: string, lead: Lead) {
  logger.info(
    { roomName, leadId: lead.id },
    "Dispatching voice AI agent to room"
  );

  // The LiveKit agent framework handles agent dispatch automatically
  // when configured with an agent server. The room metadata carries
  // the lead context so the agent knows who it's speaking with.
  const roomService = new RoomServiceClient(
    env.LIVEKIT_URL(),
    env.LIVEKIT_API_KEY(),
    env.LIVEKIT_API_SECRET()
  );

  await roomService.updateRoomMetadata(
    roomName,
    JSON.stringify({
      leadId: lead.id,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
    })
  );
}
