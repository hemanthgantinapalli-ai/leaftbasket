import React, { useState } from "react";
import { DatabaseStatus } from "../types";
import {
  Database,
  CheckCircle2,
  AlertCircle,
  X,
  Server,
  Layers,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  Zap,
} from "lucide-react";

interface MongoConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbStatus: DatabaseStatus | null;
  onConfigureURI: (uri: string) => Promise<{ success: boolean; message: string; status: DatabaseStatus }>;
  onRefreshStatus: () => Promise<void>;
}

export const MongoConfigModal: React.FC<MongoConfigModalProps> = ({
  isOpen,
  onClose,
  dbStatus,
  onConfigureURI,
  onRefreshStatus,
}) => {
  const [uriInput, setUriInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uriInput.trim()) return;

    setIsLoading(true);
    setResultMessage(null);

    try {
      const res = await onConfigureURI(uriInput.trim());
      setResultMessage({
        success: res.success,
        text: res.message || "MongoDB connection updated successfully!",
      });
      if (res.success) {
        setUriInput("");
      }
    } catch (err: any) {
      setResultMessage({
        success: false,
        text: err.message || "Failed to connect to MongoDB URI",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToMemoryMode = async () => {
    setIsLoading(true);
    setResultMessage(null);
    try {
      const res = await onConfigureURI("memory");
      setResultMessage({
        success: true,
        text: "Switched to high-speed In-Memory store mode. No IP whitelist needed!",
      });
    } catch (err: any) {
      setResultMessage({
        success: false,
        text: err.message || "Failed to switch to in-memory mode",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyIpWhitelist = () => {
    navigator.clipboard.writeText("0.0.0.0/0");
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2500);
  };

  const isIpIssue = dbStatus?.isIpWhitelistIssue || dbStatus?.error?.toLowerCase().includes("whitelist") || dbStatus?.error?.toLowerCase().includes("servers in your mongodb atlas cluster");

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl">
            🍃
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 font-['Outfit']">
              MERN Stack MongoDB Engine
            </h2>
            <p className="text-xs text-stone-500">
              Mongoose Schemas: Products · Orders · Categories · Riders · Coupons
            </p>
          </div>
        </div>

        {/* Current Connection Status Box */}
        <div
          className={`p-4 rounded-2xl border mb-5 ${
            dbStatus?.isConnected
              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
              : isIpIssue
              ? "bg-amber-50 border-amber-300 text-amber-950"
              : "bg-stone-50 border-stone-300 text-stone-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  dbStatus?.isConnected ? "bg-emerald-500 animate-pulse" : isIpIssue ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                }`}
              />
              <span className="font-extrabold text-sm">
                Status: {dbStatus?.isConnected ? "Connected to MongoDB Cloud" : "In-Memory Fallback Active"}
              </span>
            </div>
            <button
              onClick={onRefreshStatus}
              className="text-xs font-bold underline flex items-center gap-1 hover:opacity-80 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="text-xs mt-2 space-y-1">
            {dbStatus?.maskedUri ? (
              <div className="font-mono text-[11px] bg-white/70 p-2 rounded-lg border">
                URI: {dbStatus.maskedUri}
              </div>
            ) : (
              <p className="text-stone-600">
                The application is running in instant in-memory mode. All cart updates, orders, catalog filtering, and rider tracking work with zero latency.
              </p>
            )}
          </div>
        </div>

        {/* IP Whitelist Notice & Helper if connection had Atlas whitelist issue */}
        {isIpIssue && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-5">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs space-y-2">
                <p className="font-bold text-amber-900">
                  MongoDB Atlas Network Access Required
                </p>
                <p className="text-amber-800 leading-relaxed">
                  Atlas blocks connections from unknown cloud IPs by default. To connect your cluster:
                </p>
                <ol className="list-decimal list-inside text-amber-900 space-y-1 pl-1">
                  <li>Open <strong>MongoDB Atlas</strong> &gt; <strong>Network Access</strong></li>
                  <li>Click <strong>Add IP Address</strong> &gt; Select <strong>Allow Access from Anywhere</strong> (or enter <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">0.0.0.0/0</code>)</li>
                  <li>Click <strong>Confirm</strong> and re-test connection below.</li>
                </ol>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={copyIpWhitelist}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-200/70 hover:bg-amber-200 text-amber-900 font-bold rounded-lg text-[11px] cursor-pointer"
                  >
                    {copiedIp ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIp ? "Copied 0.0.0.0/0!" : "Copy 0.0.0.0/0"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSwitchToMemoryMode}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-lg text-[11px] cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Use Instant In-Memory Mode</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MongoDB URI Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
              Connect or Update MongoDB URI
            </label>
            <input
              type="text"
              required
              placeholder="mongodb+srv://username:password@cluster.mongodb.net/leafbasket"
              value={uriInput}
              onChange={(e) => setUriInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-emerald-600"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Supports MongoDB Atlas, Local MongoDB, or Railway/Render instances.
            </p>
          </div>

          {resultMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                resultMessage.success
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-rose-100 text-rose-800 border border-rose-300"
              }`}
            >
              {resultMessage.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              )}
              <span>{resultMessage.text}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={handleSwitchToMemoryMode}
              className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>In-Memory Mode</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 min-w-[140px] bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-emerald-700/20 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Server className="w-4 h-4" />
              <span>{isLoading ? "Testing..." : "Test & Connect URI"}</span>
            </button>
          </div>
        </form>

        {/* Schemas Overview Info */}
        <div className="mt-6 pt-4 border-t border-stone-200 text-xs text-stone-500">
          <div className="font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1.5">
            Active Mongoose Models
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["ProductModel", "OrderModel", "CategoryModel", "RiderModel", "CouponModel"].map((m) => (
              <span key={m} className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-mono text-[10px]">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
