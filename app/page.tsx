"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  FileText,
  Loader2,
  Pause,
  Phone,
  PhoneOff,
  Play,
  SkipBack,
  SkipForward,
  Square,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface FormData {
  name: string;
  phone: string;
  email: string;
  nbfcName: string;
  originalAmount: string;
  outstandingAmount: string;
  emiDueDate: string;
  lastPaymentDate: string;
  lastPaymentAmount: string;
}

interface TranscriptItem {
  id: string;
  type: string;
  role: "assistant" | "user";
  content: string[];
  interrupted: boolean;
}

interface TranscriptData {
  items: TranscriptItem[];
}

interface OutcomeData {
  if_the_user_promised_to_pay_then_what_was_the_amount?: string;
  if_the_user_promised_to_pay_then_what_was_the_date_in_yyyymmdd_hhmm_format?: string;
  does_the_user_promised_to_pay?: string;
  what_was_the_summary_of_the_conversation?: string;
  [key: string]: any;
}

export default function DebtCollectionDashboard() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    nbfcName: "",
    originalAmount: "",
    outstandingAmount: "",
    emiDueDate: "",
    lastPaymentDate: "",
    lastPaymentAmount: "",
  });

  const [isCallActive, setIsCallActive] = useState(false);
  const [isOngoingCall, setIsOngoingCall] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSystemReady, setIsSystemReady] = useState(true);
  const [dpd, setDpd] = useState<number>(0);
  const [roomName, setRoomName] = useState("");
  const [isPolling, setIsPolling] = useState(false);

  const [recordingUrl, setRecordingUrl] = useState("");
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(
    null
  );
  const [outcomeData, setOutcomeData] = useState<OutcomeData | null>(null);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  // Calculate DPD (Days Past Due)
  useEffect(() => {
    if (formData.emiDueDate) {
      const dueDate = new Date(formData.emiDueDate);
      const today = new Date();
      const diffTime = today.getTime() - dueDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDpd(Math.max(0, diffDays));
    }
  }, [formData.emiDueDate]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateRoomName = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const phoneLastTen = formData.phone.slice(-10);
    return `Test_Campaign_${phoneLastTen}_${timestamp}`;
  };

  const fetchMediaFiles = async (room: string) => {
    setIsLoadingMedia(true);

    try {
      // Set recording URL using proxy
      const recordingUrl = `/api/proxy?url=${encodeURIComponent(
        `https://livekitblob.blob.core.windows.net/livekitblob/${room}.mp4`
      )}`;
      setRecordingUrl(recordingUrl);

      // Fetch transcript using proxy
      try {
        const transcriptUrl = `/api/proxy?url=${encodeURIComponent(
          `https://livekitblob.blob.core.windows.net/livekitblob/transcripts/${room}.json`
        )}`;
        const transcriptResponse = await fetch(transcriptUrl);
        if (transcriptResponse.ok) {
          const transcriptData: TranscriptData =
            await transcriptResponse.json();
          setTranscriptData(transcriptData);
        }
      } catch (error) {
        console.log("[v0] Transcript not yet available:", error);
      }

      // Fetch analysis/outcome using proxy with retry logic
      await fetchAnalysisWithRetry(room, 5); // Retry up to 5 times
    } catch (error) {
      console.error("[v0] Error fetching media files:", error);
    } finally {
      setIsLoadingMedia(false);
      // System is ready for new call after processing is complete
      setIsSystemReady(true);
    }
  };

  const fetchAnalysisWithRetry = async (room: string, maxRetries: number) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const analysisUrl = `/api/proxy?url=${encodeURIComponent(
          `https://livekitblob.blob.core.windows.net/livekitblob/analysis/${room}.json`
        )}`;
        console.log(
          `[v0] Fetching analysis from: ${analysisUrl} (attempt ${attempt}/${maxRetries})`
        );
        const analysisResponse = await fetch(analysisUrl);
        console.log("[v0] Analysis response status:", analysisResponse.status);

        if (analysisResponse.ok) {
          let outcomeData = await analysisResponse.json();

          // If the response is a string containing JSON, parse it again
          if (typeof outcomeData === "string") {
            try {
              outcomeData = JSON.parse(outcomeData);
            } catch (parseError) {
              console.log(
                "[v0] Failed to parse outcome data string:",
                parseError
              );
            }
          }

          console.log("[v0] Received outcome data:", outcomeData);
          setOutcomeData(outcomeData);
          return; // Success - exit retry loop
        } else {
          console.log(
            "[v0] Analysis response not OK:",
            analysisResponse.status,
            analysisResponse.statusText
          );
          if (analysisResponse.status === 404) {
            console.log(
              `[v0] Analysis file not found on attempt ${attempt}/${maxRetries}`
            );
          }
        }
      } catch (error) {
        console.log(
          `[v0] Analysis fetch error on attempt ${attempt}/${maxRetries}:`,
          error
        );
      }

      // Wait before retrying (except on last attempt)
      if (attempt < maxRetries) {
        console.log(`[v0] Waiting 10 seconds before retry...`);
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
      }
    }

    console.log("[v0] Failed to fetch analysis after all retries");
  };

  const makeCall = async () => {
    if (!formData.phone || !formData.name) {
      alert("Please fill in at least Name and Phone Number");
      return;
    }

    const room = generateRoomName();
    setRoomName(room);

    // Set connecting state
    setIsConnecting(true);
    setIsSystemReady(false);

    const payload = {
      number: formData.phone.startsWith("+")
        ? formData.phone
        : `+91${formData.phone}`,
      roomname: room,
      info: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        nbfcName: formData.nbfcName,
        originalAmount: formData.originalAmount,
        outstandingAmount: formData.outstandingAmount,
        emiDueDate: formData.emiDueDate,
        dpd: dpd.toString(),
        lastPaymentDate: formData.lastPaymentDate,
        lastPaymentAmount: formData.lastPaymentAmount,
      },
    };

    console.log("[v0] Making call with payload:", payload);

    try {
      const response = await fetch("https://ai.rajatkhandelwal.com/makecall", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        mode: "cors",
      });

      console.log("[v0] Call response status:", response.status);

      if (response.status === 200) {
        console.log("[v0] Call initiated successfully");
        setIsConnecting(false);
        setIsCallActive(true);
        setIsOngoingCall(true);
        setIsRecording(true);
        setIsPolling(true);
        setRecordingUrl("");
        setTranscriptData(null);
        setOutcomeData(null);
        startPolling(room);
      } else {
        console.log("[v0] Call failed with status:", response.status);
        setIsConnecting(false);
        setIsSystemReady(true);
        alert("Call could not be connected");
      }
    } catch (error) {
      console.error("[v0] Error making call:", error);
      setIsConnecting(false);
      setIsSystemReady(true);
      alert("Error connecting call. Please check your network connection.");
    }
  };

  const startPolling = (room: string) => {
    console.log("[v0] Starting polling for room:", room);
    let lastRoomPresent = false;
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch("https://ai.rajatkhandelwal.com/rooms", {
          method: "GET",
          mode: "cors",
        });
        if (!response.ok) {
          console.log("[v0] Polling response not ok:", response.status);
          return;
        }
        const data = await response.json();
        console.log("[v0] Polling response:", data);
        // Check if the current room exists in the rooms array
        const roomPresent =
          data.rooms &&
          Array.isArray(data.rooms) &&
          data.rooms.some((r: any) => r.name === room);
        console.log("[v0] Room present:", roomPresent, "Room name:", room);
        console.log(
          "[v0] Available rooms:",
          data.rooms?.map((r: any) => r.name)
        );
        setIsOngoingCall(roomPresent);
        if (!roomPresent && lastRoomPresent) {
          // Call has ended
          console.log("[v0] Call has ended - room no longer present");
          setIsCallActive(false);
          setIsOngoingCall(false);
          setIsRecording(false);
          setIsPolling(false);
          clearInterval(pollInterval);
          // Immediately fetch media files after call ends
          // Keep system not ready until media files are processed
          fetchMediaFiles(room);
        }
        lastRoomPresent = roomPresent;
      } catch (error) {
        console.error("[v0] Error polling rooms:", error);
      }
    }, 2000); // Poll every 2 seconds
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsOngoingCall(false);
    setIsRecording(false);
    setIsPolling(false);
    setIsConnecting(false);
    setIsSystemReady(true);
  };

  const formatQuestion = (questionCode: string): string => {
    const questionMap: { [key: string]: string } = {
      if_the_user_promised_to_pay_then_what_was_the_amount:
        "Promised Payment Amount",
      if_the_user_promised_to_pay_then_what_was_the_date_in_yyyymmdd_hhmm_format:
        "Promised Payment Date",
      does_the_user_promised_to_pay: "Did the user promise to pay?",
      what_was_the_summary_of_the_conversation: "Conversation Summary",
      // Legacy support for old format
      q01_does_the_user_agreed_to_pay: "Does the user agree to pay?",
      q02_what_is_the_summary_of_the_conversation:
        "What is the summary of the conversation?",
      q03_what_is_the_age_of_the_user: "What is the age of the user?",
      q04_what_are_the_reasons_user_refused_to_pay:
        "What are the reasons user refused to pay?",
    };
    return (
      questionMap[questionCode] ||
      questionCode
        .replace(/_/g, " ")
        .replace(/^q\d+\s/, "")
        .replace(/^what\s/, "")
        .replace(/^if\s/, "")
        .replace(/^does\s/, "")
    );
  };

  const formatAnswer = (value: string): string => {
    if (value === "True") return "Yes";
    if (value === "False") return "No";
    if (value === "[]") return "None specified";
    if (value === "0.0") return "Not provided";

    // Handle date format (yyyymmdd_hhmm)
    if (/^\d{8}_\d{4}$/.test(value)) {
      const year = value.substring(0, 4);
      const month = value.substring(4, 6);
      const day = value.substring(6, 8);
      const hour = value.substring(9, 11);
      const minute = value.substring(11, 13);
      return `${day}/${month}/${year} ${hour}:${minute}`;
    }

    return value;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                DebtWise AI
              </h1>
              <p className="text-slate-600 text-sm">
                AI-powered debt collection management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Active
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-120px)]">
            {/* Left Panel - Form */}
            <div className="flex flex-col">
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-4 flex-shrink-0">
                  <CardTitle className="flex items-center text-lg font-semibold">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-4 min-h-0">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium">
                        Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter customer name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="Enter phone number"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="Enter email address"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="nbfcName" className="text-sm font-medium">
                        NBFC / Lender
                      </Label>
                      <Input
                        id="nbfcName"
                        value={formData.nbfcName}
                        onChange={(e) =>
                          handleInputChange("nbfcName", e.target.value)
                        }
                        placeholder="Enter lender name"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Loan Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-700 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Loan Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="originalAmount"
                          className="text-sm font-medium"
                        >
                          Original Amount
                        </Label>
                        <Input
                          id="originalAmount"
                          value={formData.originalAmount}
                          onChange={(e) =>
                            handleInputChange("originalAmount", e.target.value)
                          }
                          placeholder="₹0"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="outstandingAmount"
                          className="text-sm font-medium"
                        >
                          Outstanding Amount
                        </Label>
                        <Input
                          id="outstandingAmount"
                          value={formData.outstandingAmount}
                          onChange={(e) =>
                            handleInputChange(
                              "outstandingAmount",
                              e.target.value
                            )
                          }
                          placeholder="₹0"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="emiDueDate"
                          className="text-sm font-medium"
                        >
                          EMI Due Date
                        </Label>
                        <Input
                          id="emiDueDate"
                          type="date"
                          value={formData.emiDueDate}
                          onChange={(e) =>
                            handleInputChange("emiDueDate", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          Days Past Due
                        </Label>
                        <div className="mt-1 p-2 bg-slate-50 rounded-md flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                          <Badge
                            variant={
                              dpd > 30
                                ? "destructive"
                                : dpd > 0
                                ? "secondary"
                                : "default"
                            }
                          >
                            {dpd} days
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="lastPaymentDate"
                          className="text-sm font-medium"
                        >
                          Last Payment Date
                        </Label>
                        <Input
                          id="lastPaymentDate"
                          type="date"
                          value={formData.lastPaymentDate}
                          onChange={(e) =>
                            handleInputChange("lastPaymentDate", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="lastPaymentAmount"
                          className="text-sm font-medium"
                        >
                          Last Payment Amount
                        </Label>
                        <Input
                          id="lastPaymentAmount"
                          value={formData.lastPaymentAmount}
                          onChange={(e) =>
                            handleInputChange(
                              "lastPaymentAmount",
                              e.target.value
                            )
                          }
                          placeholder="₹0"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="p-6 pt-0 flex-shrink-0">
                  {isOngoingCall ? (
                    <Button
                      disabled
                      className="w-full bg-green-600 text-white shadow-lg animate-pulse"
                      size="lg"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Ongoing Call
                    </Button>
                  ) : (
                    <Button
                      onClick={makeCall}
                      disabled={
                        isConnecting ||
                        isCallActive ||
                        !isSystemReady ||
                        !formData.name ||
                        !formData.phone
                      }
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      size="lg"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : isCallActive ? (
                        <>
                          <Phone className="w-5 h-5 mr-2" />
                          Call in Progress...
                        </>
                      ) : !isSystemReady ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Phone className="w-5 h-5 mr-2" />
                          Start Call
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Panel - Call Interface (View Only) */}
            <div className="flex flex-col">
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>Call Management</span>
                    <div className="flex items-center space-x-2">
                      {isCallActive && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                          Live
                        </Badge>
                      )}
                      {isLoadingMedia && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          Loading...
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-6 min-h-0">
                  {/* Recording Controls Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-700">
                        Call Recording
                      </h3>
                      {recordingUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(recordingUrl, "_blank")}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>

                    {recordingUrl ? (
                      <div className="space-y-3">
                        <audio controls className="w-full">
                          <source src={recordingUrl} type="video/mp4" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    ) : isCallActive ? (
                      <div className="text-center py-6 text-slate-500 border rounded-lg bg-slate-50">
                        <div className="w-6 h-6 mx-auto mb-2 opacity-50 bg-red-500 rounded-full animate-pulse"></div>
                        <p className="text-sm">Recording in progress...</p>
                        <p className="text-xs text-slate-400 mt-2">
                          Room: {roomName}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500 border rounded-lg bg-slate-50">
                        <Download className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          Recording will appear here after the call
                        </p>
                      </div>
                    )}

                    {isCallActive && (
                      <div className="text-center space-y-2 mt-4">
                        <p className="text-xs text-slate-500">
                          Debug: isCallActive={String(isCallActive)},
                          isOngoingCall={String(isOngoingCall)}, isPolling=
                          {String(isPolling)}
                        </p>
                        <Button
                          variant="destructive"
                          onClick={endCall}
                          className="w-full"
                        >
                          <PhoneOff className="w-4 h-4 mr-2" />
                          End Call
                        </Button>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Transcript Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-700">
                        Call Transcript
                      </h3>
                      {transcriptData && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://livekitblob.blob.core.windows.net/livekitblob/transcripts/${roomName}.json`,
                              "_blank"
                            )
                          }
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>

                    {transcriptData &&
                    transcriptData.items &&
                    transcriptData.items.length > 0 ? (
                      <div className="space-y-3 max-h-[200px] overflow-y-auto border rounded-lg p-3 bg-slate-50">
                        {transcriptData.items.map((item, index) => (
                          <div
                            key={item.id || index}
                            className={`p-3 rounded-lg border-l-4 ${
                              item.role === "assistant"
                                ? "bg-blue-50 border-blue-400"
                                : "bg-green-50 border-green-400"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">
                                {item.role === "assistant"
                                  ? "Agent"
                                  : "Customer"}
                              </span>
                              {item.interrupted && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Interrupted
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-700">
                              {item.content.join(" ")}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500 border rounded-lg bg-slate-50">
                        <FileText className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          Transcript will appear here after the call
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Outcomes Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-700">
                        Call Outcomes
                      </h3>
                      <div className="flex gap-2">
                        {!outcomeData && roomName && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                fetchAnalysisWithRetry(roomName, 1)
                              }
                              disabled={isLoadingMedia}
                            >
                              {isLoadingMedia ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <BarChart3 className="w-4 h-4 mr-2" />
                              )}
                              Refresh Analysis
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const testUrl = `http://localhost:3000/api/proxy?url=${encodeURIComponent(
                                  `https://livekitblob.blob.core.windows.net/livekitblob/analysis/${roomName}.json`
                                )}`;
                                console.log("[v0] Test URL:", testUrl);
                                window.open(testUrl, "_blank");
                              }}
                            >
                              Test URL
                            </Button>
                          </>
                        )}
                        {outcomeData && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `https://livekitblob.blob.core.windows.net/livekitblob/analysis/${roomName}.json`,
                                "_blank"
                              )
                            }
                          >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>

                    {outcomeData ? (
                      <div className="space-y-3 max-h-[200px] overflow-y-auto border rounded-lg p-3 bg-slate-50">
                        {Object.entries(outcomeData)
                          .filter(
                            ([key, value]) =>
                              value !== null &&
                              value !== undefined &&
                              value !== ""
                          )
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([questionCode, answer]) => (
                            <div
                              key={questionCode}
                              className="border-l-4 border-slate-200 pl-4 py-2 bg-white rounded"
                            >
                              <div className="text-sm font-medium text-slate-700 mb-1">
                                {formatQuestion(questionCode)}
                              </div>
                              <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                                {formatAnswer(String(answer))}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500 border rounded-lg bg-slate-50">
                        <BarChart3 className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          {roomName
                            ? "Call analysis is being generated. This may take a few minutes after the call ends."
                            : "Call analysis will appear here after the call"}
                        </p>
                        {roomName && (
                          <p className="text-xs mt-2 text-slate-400">
                            You can also use the "Refresh Analysis" button above
                            to check manually.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
