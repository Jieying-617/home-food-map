"use client";

import Link from "next/link";
import { useState } from "react";
import { LogIn } from "lucide-react";
import { joinFamilyByInviteCode } from "@/lib/server/families";

export function JoinFamilyForm({ initialInviteCode = "" }: { initialInviteCode?: string }) {
  const [inviteCode, setInviteCode] = useState(initialInviteCode);
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [joinedFamilyId, setJoinedFamilyId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function join() {
    const normalizedInviteCode = inviteCode.trim();
    const normalizedNickname = nickname.trim();
    if (!normalizedInviteCode || !normalizedNickname) {
      setMessage("邀请码和称呼都要填写。");
      return;
    }

    setIsSaving(true);
    setMessage("");
    try {
      const result = await joinFamilyByInviteCode({ inviteCode: normalizedInviteCode, nickname: normalizedNickname });
      setJoinedFamilyId(result.familyId);
      setMessage("加入成功。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加入失败，请稍后再试。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-sm font-bold text-slate-700">邀请码</span>
        <input
          aria-label="邀请码"
          className="field-control text-lg font-bold uppercase tracking-wide"
          value={inviteCode}
          placeholder="例如：WOJIA"
          onChange={(event) => setInviteCode(event.target.value)}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-bold text-slate-700">我的称呼</span>
        <input
          aria-label="我的称呼"
          className="field-control"
          value={nickname}
          placeholder="例如：妈妈、爸爸、我"
          onChange={(event) => setNickname(event.target.value)}
        />
      </label>
      <button
        className="btn-primary w-full"
        type="button"
        disabled={isSaving}
        onClick={join}
      >
        <LogIn aria-hidden className="h-4 w-4" />
        {isSaving ? "加入中..." : "加入家庭"}
      </button>
      {message ? <p className="status-note">{message}</p> : null}
      {joinedFamilyId ? (
        <Link
          className="btn-dark w-full"
          href={`/f/${joinedFamilyId}/family`}
        >
          进入我们家
        </Link>
      ) : null}
    </section>
  );
}
