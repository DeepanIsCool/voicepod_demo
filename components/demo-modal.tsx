"use client";

import { CallAnalysisDashboard } from "@/components/call-analysis-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, CheckCircle, Loader2, Phone } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "./ui/badge";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

// Mock data generation logic
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

const mockLoanData: Record<
  string,
  Omit<FormData, "name" | "phone" | "email" | "nbfcName">
> = {
  personal_dpd_15: {
    originalAmount: "150000",
    outstandingAmount: "125000",
    emiDueDate: createDateForDPD(15),
    lastPaymentDate: createLastPaymentDate(15),
    lastPaymentAmount: "5500",
    loanType: "Personal Loan (DPD 15)",
  },
  smartphone_dpd_25: {
    originalAmount: "45000",
    outstandingAmount: "28000",
    emiDueDate: createDateForDPD(25),
    lastPaymentDate: createLastPaymentDate(25),
    lastPaymentAmount: "2800",
    loanType: "Smartphone EMI (DPD 25)",
  },
  twowheeler_dpd_45: {
    originalAmount: "85000",
    outstandingAmount: "62000",
    emiDueDate: createDateForDPD(45),
    lastPaymentDate: createLastPaymentDate(45),
    lastPaymentAmount: "3200",
    loanType: "2-Wheeler Loan (DPD 45)",
  },
  personal_dpd_60: {
    originalAmount: "200000",
    outstandingAmount: "175000",
    emiDueDate: createDateForDPD(60),
    lastPaymentDate: createLastPaymentDate(60),
    lastPaymentAmount: "8500",
    loanType: "Personal Loan (DPD 60)",
  },
  vitanium_dpd_75: {
    originalAmount: "120000",
    outstandingAmount: "98000",
    emiDueDate: createDateForDPD(75),
    lastPaymentDate: createLastPaymentDate(75),
    lastPaymentAmount: "4200",
    loanType: "Business Loan (DPD 75)",
  },
  personal_dpd_105: {
    originalAmount: "300000",
    outstandingAmount: "285000",
    emiDueDate: createDateForDPD(105),
    lastPaymentDate: createLastPaymentDate(105),
    lastPaymentAmount: "12000",
    loanType: "Personal Loan (DPD 105)",
  },
  smartphone_dpd_95: {
    originalAmount: "65000",
    outstandingAmount: "58000",
    emiDueDate: createDateForDPD(95),
    lastPaymentDate: createLastPaymentDate(95),
    lastPaymentAmount: "3800",
    loanType: "Smartphone EMI (DPD 95)",
  },
  personal_dpd_150: {
    originalAmount: "500000",
    outstandingAmount: "495000",
    emiDueDate: createDateForDPD(150),
    lastPaymentDate: createLastPaymentDate(150),
    lastPaymentAmount: "18000",
    loanType: "Personal Loan (DPD 150)",
  },
  twowheeler_dpd_180: {
    originalAmount: "95000",
    outstandingAmount: "92000",
    emiDueDate: createDateForDPD(180),
    lastPaymentDate: createLastPaymentDate(180),
    lastPaymentAmount: "4500",
    loanType: "2-Wheeler Loan (DPD 180)",
  },
};

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    nbfcName: "Demo NBFC",
    originalAmount: "",
    outstandingAmount: "",
    emiDueDate: "",
    lastPaymentDate: "",
    lastPaymentAmount: "",
    loanType: "",
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isOngoingCall, setIsOngoingCall] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const [isSystemReady, setIsSystemReady] = useState(true);

  const [recordingUrl, setRecordingUrl] = useState("");
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(
    null
  );
  const [outcomeData, setOutcomeData] = useState<OutcomeData | null>(null);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [dpd, setDpd] = useState<number>(0);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (formData.emiDueDate) {
      const dueDate = new Date(formData.emiDueDate);
      const today = new Date();
      const diffTime = today.getTime() - dueDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDpd(Math.max(0, diffDays));
    }
  }, [formData.emiDueDate]);

  const fillMockData = () => {
    const scenarios = Object.keys(mockLoanData);
    const randomScenarioKey =
      scenarios[Math.floor(Math.random() * scenarios.length)];
    const mockData = mockLoanData[randomScenarioKey];

    const randomOriginalAmount = (
      Math.floor(Math.random() * 400000) + 50000
    ).toString();
    const randomOutstandingPercent = Math.random() * 0.4 + 0.5;
    const randomOutstandingAmount = Math.floor(
      parseInt(randomOriginalAmount) * randomOutstandingPercent
    ).toString();
    const randomLastPaymentAmount = (
      Math.floor(Math.random() * 15000) + 2000
    ).toString();

    setFormData((prev) => ({
      ...prev,
      ...mockData,
      originalAmount: randomOriginalAmount,
      outstandingAmount: randomOutstandingAmount,
      lastPaymentAmount: randomLastPaymentAmount,
    }));
  };

  const validateField = (field: string, value: string) => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2)
          return "Full name must be at least 2 characters long";
        if (!/^[a-zA-Z\s]+$/.test(value.trim()))
          return "Full name should only contain letters and spaces";
        return "";

      case "phone":
        if (!value.trim()) return "Phone number is required";
        const phoneRegex = /^(\+91|91)?[6789]\d{9}$/;
        const cleanPhone = value.replace(/[\s\-\(\)]/g, "");
        if (!phoneRegex.test(cleanPhone))
          return "Enter a valid Indian mobile number (10 digits starting with 6, 7, 8, or 9)";
        return "";

      case "email":
        if (value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value))
            return "Please enter a valid email address";
        }
        return "";

      case "nbfcName":
        if (!value.trim()) return "NBFC name is required";
        if (value.trim().length < 2)
          return "NBFC name must be at least 2 characters long";
        return "";

      default:
        return "";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });

    // Real-time validation
    const error = validateField(field, value);
    setValidationErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    errors.name = validateField("name", formData.name);
    errors.phone = validateField("phone", formData.phone);
    errors.email = validateField("email", formData.email);
    errors.nbfcName = validateField("nbfcName", formData.nbfcName);

    setValidationErrors(errors);

    // Return true if no errors
    return !Object.values(errors).some((error) => error !== "");
  };

  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    fillMockData();
    setStep(2);
  };

  const generateRoomName = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const phoneLastTen = formData.phone.slice(-10);
    return `Test_Campaign_${phoneLastTen}_${timestamp}`;
  };

  const fetchAnalysisWithRetry = async (room: string, maxRetries: number) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const analysisUrl = `/api/proxy?url=${encodeURIComponent(
          `https://livekitblob.blob.core.windows.net/livekitblob/analysis/${room}.json`
        )}`;
        const analysisResponse = await fetch(analysisUrl);

        if (analysisResponse.ok) {
          let outcomeData = await analysisResponse.json();

          // If the response is a string containing JSON, parse it again
          if (typeof outcomeData === "string") {
            try {
              outcomeData = JSON.parse(outcomeData);
            } catch (parseError) {
              // Silent error handling for JSON parsing
            }
          }

          setOutcomeData(outcomeData);
          return; // Success - exit retry loop
        }
      } catch (error) {
        // Silent error handling for fetch errors
      }

      // Wait before retrying (except on last attempt)
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
      }
    }
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
        // Silent error handling for transcript fetch
      }

      // Fetch analysis/outcome using proxy with retry logic
      await fetchAnalysisWithRetry(room, 5); // Retry up to 5 times
    } catch (error) {
      // Silent error handling for media files
    } finally {
      setIsLoadingMedia(false);
      // System is ready for new call after processing is complete
      setIsSystemReady(true);
      setStep(4);
    }
  };

  const startPolling = (room: string) => {
    let lastRoomPresent = false;
    let pollCount = 0;
    let shouldContinuePolling = true;

    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      // Only stop polling if we explicitly detected call end or component unmounted
      if (!shouldContinuePolling) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        return;
      }

      pollCount++;

      try {
        const response = await fetch("https://ai.rajatkhandelwal.com/rooms", {
          method: "GET",
          mode: "cors",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        // Check if the current room exists in the rooms array
        const roomPresent =
          data.rooms &&
          Array.isArray(data.rooms) &&
          data.rooms.some((r: any) => r.name === room);

        setIsOngoingCall(roomPresent);

        if (!roomPresent && lastRoomPresent) {
          // Call has ended
          shouldContinuePolling = false;
          setIsCallActive(false);
          setIsOngoingCall(false);
          setIsPolling(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          fetchMediaFiles(room);
        }
        lastRoomPresent = roomPresent;
      } catch (error) {
        // Silent error handling for polling errors
      }
    }, 2000); // Poll every 2 seconds
  };

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  const handleCallTrigger = async () => {
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

    try {
      const response = await fetch("https://ai.rajatkhandelwal.com/makecall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        mode: "cors",
      });

      if (response.status === 200) {
        setIsConnecting(false);
        setIsCallActive(true);
        setIsOngoingCall(true);
        setIsPolling(true);
        // Clear previous data
        setRecordingUrl("");
        setTranscriptData(null);
        setOutcomeData(null);
        startPolling(room);
        setStep(3);
      } else {
        setIsConnecting(false);
        setIsSystemReady(true);
        alert("Call could not be connected");
      }
    } catch (error) {
      setIsConnecting(false);
      setIsSystemReady(true);
      alert("Error connecting call. Please check your network connection.");
    }
  };

  const resetModal = () => {
    // Clear polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    setStep(1);
    setFormData({
      name: "",
      phone: "",
      email: "",
      nbfcName: "Demo NBFC",
      originalAmount: "",
      outstandingAmount: "",
      emiDueDate: "",
      lastPaymentDate: "",
      lastPaymentAmount: "",
      loanType: "",
    });
    setValidationErrors({});
    setRoomName("");
    setIsPolling(false);
    setIsCallActive(false);
    setIsOngoingCall(false);
    setIsConnecting(false);
    setIsSystemReady(true);
    setRecordingUrl("");
    setTranscriptData(null);
    setOutcomeData(null);
    setIsLoadingMedia(false);
    setDpd(0);
    onClose();
  };

  if (step === 4) {
    return (
      <Dialog open={isOpen} onOpenChange={resetModal}>
        <DialogContent
          className="max-w-[95vw] sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[95vw] w-full h-[90vh] sm:h-[95vh] bg-card border-border p-0 overflow-hidden"
          showCloseButton={true}
        >
          <CallAnalysisDashboard
            customerName={formData.name}
            phoneNumber={formData.phone}
            recordingUrl={recordingUrl}
            transcriptData={transcriptData}
            outcomeData={outcomeData}
            isLoading={isLoadingMedia}
            onClose={resetModal}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={resetModal}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-foreground">
                Start Your Live Demo
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUserInfoSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`bg-input border-border text-foreground ${
                    validationErrors.name
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                  placeholder="Enter your full name"
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-600">
                    {validationErrors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`bg-input border-border text-foreground ${
                    validationErrors.phone
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                  placeholder="Enter 10-digit mobile number"
                />
                {validationErrors.phone && (
                  <p className="text-sm text-red-600">
                    {validationErrors.phone}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`bg-input border-border text-foreground ${
                    validationErrors.email
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                  placeholder="your@email.com (optional)"
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-600">
                    {validationErrors.email}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nbfcName" className="text-foreground">
                  NBFC Name *
                </Label>
                <Input
                  id="nbfcName"
                  value={formData.nbfcName}
                  onChange={(e) =>
                    handleInputChange("nbfcName", e.target.value)
                  }
                  className={`bg-input border-border text-foreground ${
                    validationErrors.nbfcName
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                  placeholder="Your Financial Institution"
                />
                {validationErrors.nbfcName && (
                  <p className="text-sm text-red-600">
                    {validationErrors.nbfcName}
                  </p>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                * Required fields
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Next
              </Button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-foreground">
                Here is your demo scenario
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Card className="bg-input border-border p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Loan Type:</span>{" "}
                  <span className="font-semibold text-foreground">
                    {formData.loanType}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Outstanding:</span>{" "}
                  <span className="font-semibold text-foreground">
                    ₹{formData.outstandingAmount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Days Past Due:</span>{" "}
                  <Badge variant={dpd > 30 ? "destructive" : "secondary"}>
                    {dpd} Days
                  </Badge>
                </div>
              </Card>
              <Button
                onClick={handleCallTrigger}
                disabled={
                  isConnecting ||
                  isCallActive ||
                  !isSystemReady ||
                  !formData.name ||
                  !formData.phone
                }
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center space-x-2"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isCallActive ? (
                  <Phone className="h-4 w-4" />
                ) : !isSystemReady ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
                <span>
                  {isConnecting
                    ? "Connecting..."
                    : isCallActive
                    ? "Call in Progress..."
                    : !isSystemReady
                    ? "Processing..."
                    : "Call Me Now"}
                </span>
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Clicking this will trigger an automated call to the phone number
                you provided.
              </p>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-foreground flex items-center justify-center space-x-2">
                {isOngoingCall ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Call In Progress</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-6 w-6 text-primary" />
                    <span>Call Completed</span>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            <Card
              className={`${
                isOngoingCall
                  ? "bg-green-50 border-green-200"
                  : "bg-primary/5 border-primary/20"
              }`}
            >
              <CardContent className="p-6 text-center">
                <div className="space-y-4">
                  <div className="text-lg font-semibold text-foreground">
                    {isOngoingCall ? "Active call to:" : "Call completed for:"}
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formData.phone}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isOngoingCall
                      ? "The AI agent is currently speaking with the customer."
                      : "The call has ended. Processing analysis..."}
                  </div>
                  {roomName && (
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      Room: {roomName}
                    </div>
                  )}
                  <div className="pt-2 border-t border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      {isOngoingCall
                        ? "You'll automatically see the analysis once the call ends."
                        : "Analysis is being generated. This may take a few minutes."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-2">
              {isOngoingCall ? (
                <Button
                  disabled
                  className="w-full bg-green-600 hover:bg-green-600 text-white cursor-default"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Ongoing Call - Please Wait
                </Button>
              ) : (
                <Button
                  onClick={() => fetchMediaFiles(roomName)}
                  disabled={isLoadingMedia}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoadingMedia ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "View Analysis"
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
