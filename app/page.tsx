"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  FileText,
  Loader2,
  Menu,
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
  Zap,
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
  loanType: string;
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

// Mock data for different DPD scenarios
const createDateForDPD = (dpd: number) => {
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() - dpd);
  return dueDate.toISOString().split("T")[0];
};

const createLastPaymentDate = (dpd: number) => {
  const today = new Date();
  const lastPayment = new Date(today);
  lastPayment.setDate(today.getDate() - Math.max(dpd + 15, 30));
  return lastPayment.toISOString().split("T")[0];
};

const mockLoanData: Record<string, FormData> = {
  // DPD 0-30 scenarios
  personal_dpd_15: {
    name: "Rajesh Kumar",
    phone: "9876543210",
    email: "rajesh.kumar@email.com",
    nbfcName: "HDFC Credit",
    originalAmount: "150000",
    outstandingAmount: "125000",
    emiDueDate: createDateForDPD(15),
    lastPaymentDate: createLastPaymentDate(15),
    lastPaymentAmount: "5500",
    loanType: "Personal Loan (DPD 15)",
  },
  smartphone_dpd_25: {
    name: "Priya Sharma",
    phone: "8765432109",
    email: "priya.sharma@email.com",
    nbfcName: "Bajaj Finserv",
    originalAmount: "45000",
    outstandingAmount: "28000",
    emiDueDate: createDateForDPD(25),
    lastPaymentDate: createLastPaymentDate(25),
    lastPaymentAmount: "2800",
    loanType: "Smartphone EMI (DPD 25)",
  },

  // DPD 30-90 scenarios
  twowheeler_dpd_45: {
    name: "Amit Singh",
    phone: "7654321098",
    email: "amit.singh@email.com",
    nbfcName: "Tata Capital",
    originalAmount: "85000",
    outstandingAmount: "62000",
    emiDueDate: createDateForDPD(45),
    lastPaymentDate: createLastPaymentDate(45),
    lastPaymentAmount: "3200",
    loanType: "2-Wheeler Loan (DPD 45)",
  },
  personal_dpd_60: {
    name: "Meera Patel",
    phone: "9123456789",
    email: "meera.patel@email.com",
    nbfcName: "ICICI Bank",
    originalAmount: "200000",
    outstandingAmount: "175000",
    emiDueDate: createDateForDPD(60),
    lastPaymentDate: createLastPaymentDate(60),
    lastPaymentAmount: "8500",
    loanType: "Personal Loan (DPD 60)",
  },
  vitanium_dpd_75: {
    name: "Suresh Reddy",
    phone: "8234567890",
    email: "suresh.reddy@email.com",
    nbfcName: "Vitanium/Bharat Plays",
    originalAmount: "120000",
    outstandingAmount: "98000",
    emiDueDate: createDateForDPD(75),
    lastPaymentDate: createLastPaymentDate(75),
    lastPaymentAmount: "4200",
    loanType: "Business Loan (DPD 75)",
  },

  // DPD 90-120 scenarios
  personal_dpd_105: {
    name: "Kavita Joshi",
    phone: "7345678901",
    email: "kavita.joshi@email.com",
    nbfcName: "Axis Bank",
    originalAmount: "300000",
    outstandingAmount: "285000",
    emiDueDate: createDateForDPD(105),
    lastPaymentDate: createLastPaymentDate(105),
    lastPaymentAmount: "12000",
    loanType: "Personal Loan (DPD 105)",
  },
  smartphone_dpd_95: {
    name: "Ravi Gupta",
    phone: "6456789012",
    email: "ravi.gupta@email.com",
    nbfcName: "Bajaj Finserv",
    originalAmount: "65000",
    outstandingAmount: "58000",
    emiDueDate: createDateForDPD(95),
    lastPaymentDate: createLastPaymentDate(95),
    lastPaymentAmount: "3800",
    loanType: "Smartphone EMI (DPD 95)",
  },

  // DPD 120+ scenarios
  personal_dpd_150: {
    name: "Deepak Shah",
    phone: "5567890123",
    email: "deepak.shah@email.com",
    nbfcName: "SBI",
    originalAmount: "500000",
    outstandingAmount: "495000",
    emiDueDate: createDateForDPD(150),
    lastPaymentDate: createLastPaymentDate(150),
    lastPaymentAmount: "18000",
    loanType: "Personal Loan (DPD 150)",
  },
  twowheeler_dpd_180: {
    name: "Anjali Nair",
    phone: "4678901234",
    email: "anjali.nair@email.com",
    nbfcName: "Hero FinCorp",
    originalAmount: "95000",
    outstandingAmount: "92000",
    emiDueDate: createDateForDPD(180),
    lastPaymentDate: createLastPaymentDate(180),
    lastPaymentAmount: "4500",
    loanType: "2-Wheeler Loan (DPD 180)",
  },
};

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
    loanType: "",
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

  const fillMockData = (scenarioKey: string) => {
    const mockData = mockLoanData[scenarioKey];
    const {
      phone,
      name,
      email,
      nbfcName,
      originalAmount,
      outstandingAmount,
      lastPaymentAmount,
      ...otherData
    } = mockData;

    // Generate random values for numeric fields
    const randomOriginalAmount = (
      Math.floor(Math.random() * 400000) + 50000
    ).toString(); // 50k to 450k
    const randomOutstandingPercent = Math.random() * 0.4 + 0.5; // 50% to 90% outstanding
    const randomOutstandingAmount = Math.floor(
      parseInt(randomOriginalAmount) * randomOutstandingPercent
    ).toString();
    const randomLastPaymentAmount = (
      Math.floor(Math.random() * 15000) + 2000
    ).toString(); // 2k to 17k

    setFormData((prev) => ({
      ...prev,
      ...otherData,
      originalAmount: randomOriginalAmount,
      outstandingAmount: randomOutstandingAmount,
      lastPaymentAmount: randomLastPaymentAmount,
      name: "",
      email: "",
      nbfcName: "",
      phone: "",
    }));
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
        loanType: formData.loanType,
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
      <header className="bg-white border-b border-slate-200 px-4 py-2 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                DebtWise AI
              </h1>
              <p className="text-slate-600 text-xs">
                AI-powered debt collection management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 text-xs"
              >
                Active
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 pb-8">
        <div className="max-w-7xl mx-auto p-3 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:min-h-[calc(100vh-120px)]">
            {/* Left Panel - Form */}
            <div className="flex flex-col">
              <Card className="flex flex-col lg:flex-1 lg:overflow-hidden lg:h-full">
                <CardHeader className="pb-2 flex-shrink-0">
                  <CardTitle className="flex items-center text-base font-semibold">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm lg:flex-1 lg:overflow-y-auto lg:min-h-0">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="name" className="text-xs font-medium">
                        Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter customer name"
                        className="mt-1 h-10 md:h-8 text-sm md:text-xs"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-xs font-medium">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="Enter phone number"
                        className="mt-1 h-10 md:h-8 text-sm md:text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="email" className="text-xs font-medium">
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
                        className="mt-1 h-10 md:h-8 text-sm md:text-xs"
                      />
                    </div>

                    <div>
                      <Label htmlFor="nbfcName" className="text-xs font-medium">
                        NBFC / Lender
                      </Label>
                      <Input
                        id="nbfcName"
                        value={formData.nbfcName}
                        onChange={(e) =>
                          handleInputChange("nbfcName", e.target.value)
                        }
                        placeholder="Enter lender name"
                        className="mt-1 h-10 md:h-8 text-sm md:text-xs"
                      />
                    </div>
                  </div>

                  {/* Loan Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-slate-700 flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        Loan Details
                      </h3>
                      <Button
                        onClick={() => {
                          // Generate random scenario
                          const scenarios = [
                            "personal_dpd_15",
                            "smartphone_dpd_25",
                            "twowheeler_dpd_45",
                            "personal_dpd_60",
                            "vitanium_dpd_75",
                            "smartphone_dpd_95",
                            "personal_dpd_105",
                            "personal_dpd_150",
                            "twowheeler_dpd_180",
                          ];
                          const randomScenario =
                            scenarios[
                              Math.floor(Math.random() * scenarios.length)
                            ];
                          fillMockData(randomScenario);
                        }}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                      >
                        Generate
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label
                          htmlFor="originalAmount"
                          className="text-xs font-medium"
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
                          className="mt-1 h-10 md:h-8 text-sm md:text-xs"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="outstandingAmount"
                          className="text-xs font-medium"
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
                          className="mt-1 h-10 md:h-8 text-sm md:text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label
                          htmlFor="emiDueDate"
                          className="text-xs font-medium"
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
                          className="mt-1 h-10 md:h-8 text-sm md:text-xs"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-medium">
                          Days Past Due
                        </Label>
                        <div className="mt-1 p-1 bg-slate-50 rounded-md flex items-center">
                          <Calendar className="w-3 h-3 mr-1 text-slate-500" />
                          <Badge
                            variant={
                              dpd > 30
                                ? "destructive"
                                : dpd > 0
                                ? "secondary"
                                : "default"
                            }
                            className="text-xs"
                          >
                            {dpd} days
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label
                          htmlFor="lastPaymentDate"
                          className="text-xs font-medium"
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
                          className="mt-1 h-10 md:h-8 text-sm md:text-xs"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="lastPaymentAmount"
                          className="text-xs font-medium"
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
                          className="mt-1 h-10 md:h-8 text-sm md:text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="p-3 pt-0 flex-shrink-0">
                  {isOngoingCall ? (
                    <Button
                      disabled
                      className="w-full bg-green-600 text-white shadow-lg animate-pulse h-12 md:h-8"
                      size="sm"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      <span className="text-xs">Ongoing Call</span>
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
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed h-12 md:h-8"
                      size="sm"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          <span className="text-xs">Connecting...</span>
                        </>
                      ) : isCallActive ? (
                        <>
                          <Phone className="w-3 h-3 mr-1" />
                          <span className="text-xs">Call in Progress...</span>
                        </>
                      ) : !isSystemReady ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          <span className="text-xs">Processing...</span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-3 h-3 mr-1" />
                          <span className="text-xs">Start Call</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Panel - Call Interface (View Only) */}
            <div className="flex flex-col">
              <Card className="flex flex-col lg:flex-1 lg:overflow-hidden lg:h-full">
                <CardHeader className="pb-2 flex-shrink-0">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>Call Management</span>
                    <div className="flex items-center space-x-2">
                      {isCallActive && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 text-xs"
                        >
                          <div className="w-1 h-1 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                          Live
                        </Badge>
                      )}
                      {isLoadingMedia && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 text-xs"
                        >
                          Loading...
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm lg:flex-1 lg:overflow-y-auto lg:min-h-0">
                  {/* Outcomes Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-slate-700">
                        Call Outcomes
                      </h3>
                      <div className="flex gap-1">
                        {!outcomeData && roomName && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                fetchAnalysisWithRetry(roomName, 1)
                              }
                              disabled={isLoadingMedia}
                              className="h-6 px-2 text-xs"
                            >
                              {isLoadingMedia ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <BarChart3 className="w-3 h-3 mr-1" />
                              )}
                              Refresh
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
                              className="h-6 px-2 text-xs"
                            >
                              Test
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
                            className="h-6 px-2 text-xs"
                          >
                            <BarChart3 className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>

                    {outcomeData ? (
                      <div className="space-y-2 max-h-[180px] overflow-y-auto border rounded-lg p-2 bg-slate-50">
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
                              className="border-l-2 border-slate-200 pl-2 py-1 bg-white rounded"
                            >
                              <div className="text-xs font-medium text-slate-700 mb-1">
                                {formatQuestion(questionCode)}
                              </div>
                              <div className="text-xs text-slate-600 bg-slate-50 p-1 rounded">
                                {formatAnswer(String(answer))}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-3 text-slate-500 border rounded-lg bg-slate-50">
                        <BarChart3 className="w-4 h-4 mx-auto mb-1 opacity-50" />
                        <p className="text-xs">
                          {roomName
                            ? "Call analysis is being generated. This may take a few minutes after the call ends."
                            : "Call analysis will appear here after the call"}
                        </p>
                        {roomName && (
                          <p className="text-xs mt-1 text-slate-400">
                            You can also use the "Refresh" button above to check
                            manually.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <Separator className="my-2" />
                  {/* Recording Controls Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-slate-700">
                        Call Recording
                      </h3>
                      {recordingUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(recordingUrl, "_blank")}
                          className="h-6 px-2 text-xs"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>

                    {recordingUrl ? (
                      <div className="space-y-2">
                        <audio controls className="w-full h-6">
                          <source src={recordingUrl} type="video/mp4" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    ) : isCallActive ? (
                      <div className="text-center py-3 text-slate-500 border rounded-lg bg-slate-50">
                        <div className="w-4 h-4 mx-auto mb-1 opacity-50 bg-red-500 rounded-full animate-pulse"></div>
                        <p className="text-xs">Recording in progress...</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Room: {roomName}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-3 text-slate-500 border rounded-lg bg-slate-50">
                        <Download className="w-4 h-4 mx-auto mb-1 opacity-50" />
                        <p className="text-xs">
                          Recording will appear here after the call
                        </p>
                      </div>
                    )}

                    {isCallActive && (
                      <div className="text-center space-y-1 mt-2">
                        <p className="text-xs text-slate-500">
                          Debug: isCallActive={String(isCallActive)},
                          isOngoingCall={String(isOngoingCall)}, isPolling=
                          {String(isPolling)}
                        </p>
                        <Button
                          variant="destructive"
                          onClick={endCall}
                          className="w-full h-6 text-xs"
                          size="sm"
                        >
                          <PhoneOff className="w-3 h-3 mr-1" />
                          End Call
                        </Button>
                      </div>
                    )}
                  </div>
                  <Separator className="my-2" />
                  {/* Transcript Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-slate-700">
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
                          className="h-6 px-2 text-xs"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>

                    {transcriptData &&
                    transcriptData.items &&
                    transcriptData.items.length > 0 ? (
                      <div className="space-y-2 max-h-[180px] overflow-y-auto border rounded-lg p-2 bg-slate-50">
                        {transcriptData.items.map((item, index) => (
                          <div
                            key={item.id || index}
                            className={`p-2 rounded-lg border-l-2 ${
                              item.role === "assistant"
                                ? "bg-blue-50 border-blue-400"
                                : "bg-green-50 border-green-400"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">
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
                            <p className="text-xs text-slate-700">
                              {item.content.join(" ")}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-3 text-slate-500 border rounded-lg bg-slate-50">
                        <FileText className="w-4 h-4 mx-auto mb-1 opacity-50" />
                        <p className="text-xs">
                          Transcript will appear here after the call
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator className="my-2" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
