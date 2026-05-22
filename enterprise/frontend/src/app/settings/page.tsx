"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Shield, Building, Sparkles } from "lucide-react";

export default function SettingsPage() {
  // State for notifications
  const [notifications, setNotifications] = useState({
    emailShipment: true,
    emailInvoice: true,
    emailExpense: false,
    smsShipment: true,
    smsDelay: false,
    pushTracking: true,
    pushSpeed: true,
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveNotifications = () => {
    console.log("Saving notification settings...", notifications);
    alert("Notification preferences saved successfully!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            Settings <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage your account, organization details, security, and communication preferences.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full justify-start border-b border-zinc-800 bg-transparent p-0 gap-6 rounded-none h-auto pb-3 flex">
            <TabsTrigger
              value="profile"
              className="gap-2 bg-transparent text-zinc-400 hover:text-zinc-100 data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-1 pb-3 pt-0 text-sm font-semibold transition-all"
            >
              <User className="w-4 h-4" /> Profile Details
            </TabsTrigger>
            <TabsTrigger
              value="company"
              className="gap-2 bg-transparent text-zinc-400 hover:text-zinc-100 data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-1 pb-3 pt-0 text-sm font-semibold transition-all"
            >
              <Building className="w-4 h-4" /> Company Details
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="gap-2 bg-transparent text-zinc-400 hover:text-zinc-100 data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-1 pb-3 pt-0 text-sm font-semibold transition-all"
            >
              <Shield className="w-4 h-4" /> Security
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="gap-2 bg-transparent text-zinc-400 hover:text-zinc-100 data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-1 pb-3 pt-0 text-sm font-semibold transition-all"
            >
              <Bell className="w-4 h-4" /> Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="outline-none">
            <Card className="bg-zinc-950/40 border-zinc-800 backdrop-blur-md animate-in fade-in-50 duration-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-zinc-100">Profile Details</CardTitle>
                <CardDescription className="text-zinc-400">
                  Update your personal details and how others see you on the platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-zinc-300">First Name</Label>
                    <Input
                      id="firstName"
                      defaultValue="Admin"
                      className="bg-zinc-900/60 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-zinc-300">Last Name</Label>
                    <Input
                      id="lastName"
                      defaultValue="User"
                      className="bg-zinc-900/60 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="admin@ttc.com"
                    className="bg-zinc-900/60 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-2 transition-all">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="outline-none">
            <Card className="bg-zinc-950/40 border-zinc-800 backdrop-blur-md animate-in fade-in-50 duration-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-zinc-100">Company Details</CardTitle>
                <CardDescription className="text-zinc-400">
                  Manage your organization's legal and public information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-zinc-300">Company Name</Label>
                  <Input
                    id="companyName"
                    defaultValue="SKRT CORP"
                    className="bg-zinc-900/60 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstin" className="text-zinc-300">GSTIN</Label>
                  <Input
                    id="gstin"
                    defaultValue="08AAAAA0000A1Z5"
                    className="bg-zinc-900/60 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-zinc-300">Address</Label>
                  <Input
                    id="address"
                    defaultValue="Bhilwara, Rajasthan, India"
                    className="bg-zinc-900/60 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-2 transition-all">
                  Update Organization
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="outline-none">
            <Card className="bg-zinc-950/40 border-zinc-800 backdrop-blur-md animate-in fade-in-50 duration-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-zinc-100">Security Settings</CardTitle>
                <CardDescription className="text-zinc-400">
                  Secure your account with a strong password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPass" className="text-zinc-300">Current Password</Label>
                  <Input
                    id="currentPass"
                    type="password"
                    className="bg-zinc-900/60 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPass" className="text-zinc-300">New Password</Label>
                  <Input
                    id="newPass"
                    type="password"
                    className="bg-zinc-900/60 border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-2 transition-all">
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="outline-none">
            <Card className="bg-zinc-950/40 border-zinc-800 backdrop-blur-md animate-in fade-in-50 duration-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-zinc-100">Notification Preferences</CardTitle>
                <CardDescription className="text-zinc-400">
                  Configure when and how you want to receive status alerts and reports.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications Group */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-primary">Email Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-zinc-200">Shipment Updates</p>
                        <p className="text-xs text-zinc-400 font-normal">Receive copy of LR, loading memos, and dispatch notes.</p>
                      </div>
                      <button
                        onClick={() => handleToggle("emailShipment")}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          notifications.emailShipment ? "bg-primary" : "bg-zinc-800"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            notifications.emailShipment ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-zinc-200">Weekly Invoices Summary</p>
                        <p className="text-xs text-zinc-400 font-normal">Receive weekly consolidated accounts reports & PDF summaries.</p>
                      </div>
                      <button
                        onClick={() => handleToggle("emailInvoice")}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          notifications.emailInvoice ? "bg-primary" : "bg-zinc-800"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            notifications.emailInvoice ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-zinc-200">Expense Approvals</p>
                        <p className="text-xs text-zinc-400 font-normal">Get notified when a driver records an expense requiring review.</p>
                      </div>
                      <button
                        onClick={() => handleToggle("emailExpense")}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          notifications.emailExpense ? "bg-primary" : "bg-zinc-800"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            notifications.emailExpense ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* SMS Notifications Group */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-400">SMS / WhatsApp Alerts</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-zinc-200">Critical Transit Updates</p>
                        <p className="text-xs text-zinc-400 font-normal">SMS updates automatically sent to Consignor & Consignee during dispatch.</p>
                      </div>
                      <button
                        onClick={() => handleToggle("smsShipment")}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          notifications.smsShipment ? "bg-primary" : "bg-zinc-800"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            notifications.smsShipment ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-zinc-200">Delay Warning Alerts</p>
                        <p className="text-xs text-zinc-400 font-normal">Receive SMS warning if vehicle is idle or running late by 4+ hours.</p>
                      </div>
                      <button
                        onClick={() => handleToggle("smsDelay")}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          notifications.smsDelay ? "bg-primary" : "bg-zinc-800"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            notifications.smsDelay ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Push Notifications Group */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-amber-500">Live In-App Push Alerts</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-zinc-200">Live Geo-tracking Alerts</p>
                        <p className="text-xs text-zinc-400 font-normal">Receive toast alerts when shipments enter or exit geofences.</p>
                      </div>
                      <button
                        onClick={() => handleToggle("pushTracking")}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          notifications.pushTracking ? "bg-primary" : "bg-zinc-800"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            notifications.pushTracking ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-zinc-200">Overspeed/Harsh Braking Warnings</p>
                        <p className="text-xs text-zinc-400 font-normal">Instant dashboard alert when vehicle violates IoT safety thresholds.</p>
                      </div>
                      <button
                        onClick={() => handleToggle("pushSpeed")}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          notifications.pushSpeed ? "bg-primary" : "bg-zinc-800"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            notifications.pushSpeed ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleSaveNotifications}
                    className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-2 transition-all"
                  >
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
