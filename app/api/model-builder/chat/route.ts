// app/api/model-builder/chat/route.ts
import { NextResponse } from "next/server";
import type { ModelState, Topic } from "@/lib/model/types";
import { updateStateFromUserMessage, deriveCrossTopicHints } from "@/lib/model/update";
import { withNarrative } from "@/lib/model/narrative";
import { recomputeAll } from "@/lib/model/types";
import { hydrateFromCompanyData } from "@/lib/model/hydrate";
import { buildNextQuestion } from "@/lib/model/question";
import { pickNextTopic, allTopicsReady } from "@/lib/model/flow";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userMessage: string = String(body?.userMessage ?? "");
    const activeTopicId: string = String(body?.activeTopicId ?? "");
    const prevState: ModelState | null = body?.modelState ?? null;
    const companyData = body?.companyData ?? null;
    const promptsKey = body?.promptsKey ?? "model_builder_v2";

    if (!prevState || !activeTopicId) {
      return NextResponse.json(
        { error: "Missing modelState or activeTopicId" },
        { status: 400 }
      );
    }

    // Pre-hydrate from company data so we don't re-ask what's already known
    let nextState = hydrateFromCompanyData(prevState);

    // Derive cross-topic hints from the pre-hydrated state
    const preHints = deriveCrossTopicHints(nextState.crossSignals);

    // Update state from this user message (now honoring hints)
    nextState = updateStateFromUserMessage(nextState, {
      activeTopicId,
      userMessage,
      companyData,
      crossHints: preHints,
    });

    // 2) Regenerate narratives for all topics (lightweight, additive)
    nextState = {
      ...nextState,
      topics: nextState.topics.map(withNarrative),
    };

    // 3) Recompute progress (already done inside update but safe to ensure)
    nextState = recomputeAll(nextState);

    // 2b) Derive POST-update hints for UI/debug
    const postHints = deriveCrossTopicHints(nextState.crossSignals);

    // Prepare assistant message with context-aware next question + pacing
    const active = nextState.topics.find(t => t.id === nextState.activeTopicId);
    const becameReady = active?.readyToModel;

    let assistantMessage: string;
    let unmetList: string[] = [];

    if (allTopicsReady(nextState)) {
      assistantMessage = "🎉 All topics are covered. I can now generate a full model draft or cash flow projection for you.";
    } else if (becameReady) {
      const nextId = pickNextTopic(nextState);
      if (nextId) {
        nextState.activeTopicId = nextId;
        assistantMessage = `✅ **${active?.name} covered.** Let's move on to **${nextId.replace(/_/g, " ")}**.`;
      } else {
        assistantMessage = `✅ **${active?.name} covered.** All other topics seem ready.`;
      }
    } else if ((nextState.consecutiveFollowups ?? 0) >= 2) {
      const result = buildNextQuestion(nextState, nextState.activeTopicId);
      unmetList = result.unmetList;
      assistantMessage = `Let's pause. Here's what we still need for **${active?.name}**:\n- ${unmetList.join("\n- ")}`;
      nextState.consecutiveFollowups = 0;
    } else {
      const { text } = buildNextQuestion(nextState, nextState.activeTopicId);
      assistantMessage = text;
    }

    return NextResponse.json({
      assistantMessage,
      modelState: nextState,
      unmetQuestions: unmetList,
      crossTopicHints: postHints,
      suggestedNextTopicId: undefined,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Chat handler failed", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
