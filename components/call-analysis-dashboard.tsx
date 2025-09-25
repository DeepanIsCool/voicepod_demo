"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Loader2,
  Phone,
  Play,
  User,
  X,
} from "lucide-react";

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

interface CallAnalysisDashboardProps {
  customerName: string;
  phoneNumber: string;
  recordingUrl: string;
  transcriptData: TranscriptData | null;
  outcomeData: OutcomeData | null;
  isLoading: boolean;
  onClose?: () => void;
}

export function CallAnalysisDashboard({
  customerName,
  phoneNumber,
  recordingUrl,
  transcriptData,
  outcomeData,
  isLoading,
  onClose,
}: CallAnalysisDashboardProps) {
  const formatQuestion = (questionCode: string): string => {
    const questionMap: { [key: string]: string } = {
      if_the_user_promised_to_pay_then_what_was_the_amount: "Payment Amount",
      if_the_user_promised_to_pay_then_what_was_the_date_in_yyyymmdd_hhmm_format:
        "Payment Date",
      does_the_user_promised_to_pay: "Payment Promise",
      what_was_the_summary_of_the_conversation: "Call Summary",
    };

    return (
      questionMap[questionCode] ||
      questionCode
        .replace(/_/g, " ")
        .replace(/^(what|if|does)\s/, "")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  const formatAnswer = (value: string): string => {
    if (value === "True") return "Yes";
    if (value === "False") return "No";
    if (value === "[]" || value === "0.0") return "Not specified";

    // Handle date format (yyyymmdd_hhmm)
    if (/^\d{8}_\d{4}$/.test(value)) {
      const year = value.substring(0, 4);
      const month = value.substring(4, 6);
      const day = value.substring(6, 8);
      const hour = value.substring(9, 11);
      const minute = value.substring(11, 13);
      return `${day}/${month}/${year} at ${hour}:${minute}`;
    }

    return value;
  };

  const getOutcomeStatus = () => {
    if (!outcomeData)
      return { status: "pending", color: "bg-amber-100 text-amber-800" };

    const promised = outcomeData.does_the_user_promised_to_pay;
    if (promised === "True")
      return { status: "success", color: "bg-green-100 text-green-800" };
    if (promised === "False")
      return { status: "failed", color: "bg-red-100 text-red-800" };
    return { status: "unclear", color: "bg-gray-100 text-gray-800" };
  };

  const outcome = getOutcomeStatus();

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 w-full flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                Call Analysis
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600 truncate">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{customerName}</span>
                <span className="text-gray-400 flex-shrink-0">•</span>
                <span className="truncate">{phoneNumber}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="bg-black text-white hover:bg-gray-800"
              onClick={onClose}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 w-full overflow-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full">
          {/* Left Column - Recording */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-gray-900 flex items-center">
                  <Play className="h-5 w-5 mr-2 text-gray-600" />
                  Recording
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-20 bg-gray-50 rounded-lg">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-600">
                      Loading...
                    </span>
                  </div>
                ) : recordingUrl ? (
                  <div className="space-y-4">
                    <audio
                      controls
                      className="w-full bg-gray-50 rounded-lg h-10 sm:h-12"
                    >
                      <source src={recordingUrl} type="video/mp4" />
                      Your browser does not support audio playback.
                    </audio>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-gray-600"
                      onClick={() => window.open(recordingUrl, "_blank")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Recording
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Play className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">
                      Recording not available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Key Outcomes */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-gray-900 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-gray-600" />
                  Key Outcomes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-3 text-gray-600">
                      Analyzing call outcomes...
                    </span>
                  </div>
                ) : outcomeData ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(outcomeData)
                      .filter(
                        ([, value]) =>
                          value && value !== "[]" && value !== "0.0"
                      )
                      .map(([key, value]) => (
                        <div
                          key={key}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <div className="text-sm font-medium text-gray-700 mb-1">
                            {formatQuestion(key)}
                          </div>
                          <div className="text-gray-900 font-medium">
                            {formatAnswer(String(value))}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <BarChart3 className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Analysis pending</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Results will appear after call processing
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transcript */}
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-gray-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-gray-600" />
                    Conversation Transcript
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-3 text-gray-600">
                      Loading transcript...
                    </span>
                  </div>
                ) : transcriptData?.items && transcriptData.items.length > 0 ? (
                  <ScrollArea className="h-64 sm:h-80 lg:h-96">
                    <div className="space-y-4">
                      {transcriptData.items.map((item, index) => (
                        <div
                          key={item.id || index}
                          className={`p-3 sm:p-4 rounded-lg border transition-all ${
                            item.role === "assistant"
                              ? "bg-blue-50 border-blue-200 ml-0 mr-2 sm:mr-8"
                              : "bg-green-50 border-green-200 ml-2 sm:ml-8 mr-0"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-xs font-semibold uppercase tracking-wide ${
                                item.role === "assistant"
                                  ? "text-blue-700"
                                  : "text-green-700"
                              }`}
                            >
                              {item.role === "assistant"
                                ? "AI Agent"
                                : "Customer"}
                            </span>
                            {item.interrupted && (
                              <Badge variant="destructive" className="text-xs">
                                Interrupted
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {item.content.join(" ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FileText className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">
                      Transcript not available
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Transcript will appear here after the call
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
