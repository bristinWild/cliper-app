import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Markdown } from "../../../components/Markdown";
import { SegmentedControl } from "../../../components/SegmentedControl";
import { TaskTimeline } from "../../../components/TaskTimeline";
import { StatusDot } from "../../../components/ui";
import { fakeAnswer, seedMessages } from "../../../lib/mock";
import { useCliper } from "../../../lib/store";
import { colors, mono, radius } from "../../../lib/theme";
import { ChatMessage } from "../../../lib/types";

type Mode = "Ask" | "Agent";
type FeedItem =
  | { type: "message"; message: ChatMessage }
  | { type: "task"; taskId: string }
  | { type: "thinking" };

const askSuggestions = [
  "How does authentication work?",
  "Explain payment flow",
  "Where is Redis used?",
  "Summarize the latest PR",
];

const agentSuggestions = [
  "Implement GitHub OAuth",
  "Fix failing tests",
  "Refactor authentication",
  "Upgrade React Native",
];

export default function Chat() {
  const { id, mode: modeParam } = useLocalSearchParams<{ id: string; mode?: Mode }>();
  const router = useRouter();
  const repo = useCliper((s) => s.repositories.find((r) => r.id === id));
  const tasks = useCliper((s) => s.tasks);
  const runTask = useCliper((s) => s.runTask);

  const [mode, setMode] = useState<Mode>(modeParam === "Agent" ? "Agent" : "Ask");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<FlatList<FeedItem>>(null);

  const feed: FeedItem[] = useMemo(() => {
    const items: FeedItem[] = messages.map((m) => ({ type: "message", message: m }));
    taskIds.forEach((taskId) => items.push({ type: "task", taskId }));
    if (thinking) items.push({ type: "thinking" });
    return items;
  }, [messages, taskIds, thinking]);

  const send = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    setInput("");

    const userMsg: ChatMessage = {
      id: `u${Date.now()}`,
      role: "user",
      content,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    if (mode === "Ask") {
      // POST /repositories/:id/chat
      setThinking(true);
      setTimeout(() => {
        setThinking(false);
        setMessages((prev) => [...prev, fakeAnswer(content)]);
      }, 900);
    } else {
      // POST /repositories/:id/tasks → then events stream over /ws
      const taskId = runTask(id!, content);
      setTaskIds((prev) => [...prev, taskId]);
    }

    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const suggestions = mode === "Ask" ? askSuggestions : agentSuggestions;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top", "bottom"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 12,
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={{ color: colors.textSecondary, fontSize: 17 }}>←</Text>
        </Pressable>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={[mono, { color: colors.text, fontSize: 16, fontWeight: "700" }]}>{repo?.name}</Text>
          <StatusDot status={repo?.agentStatus ?? "offline"} />
        </View>
        <View style={{ width: 150 }}>
          <SegmentedControl options={["Ask", "Agent"] as const} value={mode} onChange={setMode} />
        </View>
      </View>

      {/* Feed */}
      <FlatList
        ref={listRef}
        data={feed}
        keyExtractor={(item, i) =>
          item.type === "message" ? item.message.id : item.type === "task" ? item.taskId : `think-${i}`
        }
        contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 24 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          if (item.type === "thinking") {
            return (
              <Text style={{ color: colors.textFaint, fontSize: 13, marginLeft: 4 }}>Reading memory…</Text>
            );
          }
          if (item.type === "task") {
            const task = tasks.find((t) => t.id === item.taskId);
            if (!task) return null;
            return task.events.length === 0 ? (
              <Text style={{ color: colors.textFaint, fontSize: 13, marginLeft: 4 }}>Task queued…</Text>
            ) : (
              <TaskTimeline task={task} />
            );
          }
          return <MessageBubble message={item.message} />;
        }}
      />

      {/* Suggestions */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 10 }}
        style={{ flexGrow: 0 }}
      >
        {suggestions.map((s) => (
          <Pressable
            key={s}
            onPress={() => send(s)}
            style={({ pressed }) => ({
              backgroundColor: pressed ? colors.cardRaised : colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.pill,
              paddingHorizontal: 14,
              paddingVertical: 8,
            })}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{s}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Floating input */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            backgroundColor: colors.card,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            paddingLeft: 16,
            paddingRight: 6,
            paddingVertical: 6,
            gap: 8,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            multiline
            placeholder={
              mode === "Ask" ? "Ask anything about your repository..." : "Describe a coding task..."
            }
            placeholderTextColor={colors.textFaint}
            style={{
              flex: 1,
              color: colors.text,
              fontSize: 15,
              maxHeight: 110,
              paddingVertical: 8,
            }}
          />
          <Pressable
            onPress={() => send()}
            disabled={!input.trim()}
            style={({ pressed }) => ({
              width: 38,
              height: 38,
              borderRadius: 13,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: input.trim() ? (pressed ? "#5B4DE0" : colors.accent) : colors.cardRaised,
            })}
          >
            <Text style={{ color: input.trim() ? "#FFF" : colors.textFaint, fontSize: 16, fontWeight: "700" }}>
              ↑
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  if (isUser) {
    return (
      <View style={{ alignItems: "flex-end" }}>
        <View
          style={{
            backgroundColor: colors.accent,
            borderRadius: radius.lg,
            borderBottomRightRadius: 6,
            paddingHorizontal: 14,
            paddingVertical: 10,
            maxWidth: "84%",
          }}
        >
          <Text style={{ color: "#FFF", fontSize: 15, lineHeight: 21 }}>{message.content}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={{ alignItems: "flex-start" }}>
      <View
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.lg,
          borderBottomLeftRadius: 6,
          padding: 14,
          maxWidth: "92%",
          gap: 10,
        }}
      >
        <Markdown content={message.content} />

        {message.references && (
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.textFaint, fontSize: 11, letterSpacing: 0.4, textTransform: "uppercase" }}>
              References
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {message.references.map((ref) => (
                <View
                  key={ref}
                  style={{
                    backgroundColor: colors.accentSoft,
                    borderRadius: radius.sm,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={[mono, { color: colors.accent, fontSize: 11.5 }]}>{ref}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {message.latencyMs != null && (
          <Text style={{ color: colors.textFaint, fontSize: 11 }}>
            {message.latencyMs}ms · {Math.round((message.confidence ?? 0) * 100)}% confidence
          </Text>
        )}
      </View>
    </View>
  );
}
