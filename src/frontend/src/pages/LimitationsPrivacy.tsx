import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Shield, AlertTriangle, Lock } from 'lucide-react';

export default function LimitationsPrivacy() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Limitations & Privacy</h1>
          <p className="text-muted-foreground">Important information about how this app works</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-destructive" />
                Web Application Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This is a web application running in your browser. It has important limitations compared to native
                mobile apps:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  <strong>No automatic device touch detection:</strong> The app cannot detect when someone physically
                  touches or picks up the device. Real device-level touch detection requires native OS features not
                  available to web apps.
                </li>
                <li>
                  <strong>Manual trigger required:</strong> A linked child must actively open this web app and trigger
                  the alarm manually (or it can be simulated for testing).
                </li>
                <li>
                  <strong>Browser-only operation:</strong> The alarm only works while the browser tab is open. It
                  cannot run in the background or when the device is locked.
                </li>
                <li>
                  <strong>No system-level monitoring:</strong> This app cannot monitor other apps, phone calls, or
                  system activities.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-destructive" />
                Privacy & Biometric Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                <strong>This app does NOT collect, store, or process any biometric data.</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  <strong>No fingerprints:</strong> We do not capture or store fingerprint scans or templates.
                </li>
                <li>
                  <strong>No facial recognition:</strong> We do not capture or store facial images or facial
                  recognition data.
                </li>
                <li>
                  <strong>No biometric templates:</strong> We do not create, store, or process any biometric templates
                  or identifiers.
                </li>
              </ul>
              <p className="text-muted-foreground">
                Instead, this app uses <strong>Internet Identity</strong>, which is a privacy-preserving authentication
                system. Internet Identity may use your device's built-in authentication (like Face ID or Touch ID) to
                verify it's you, but:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Your biometric data never leaves your device</li>
                <li>We only receive a cryptographic identity (principal ID), not biometric data</li>
                <li>Your device handles all biometric processing locally</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Intended Use & Age Restrictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This app is designed for <strong>guardian-managed use for children under 13 years old</strong>.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  <strong>Guardian control:</strong> Only guardians (parents/caregivers) should set up and manage child
                  profiles.
                </li>
                <li>
                  <strong>Supervised use:</strong> This app is intended for supervised environments where guardians
                  actively monitor device usage.
                </li>
                <li>
                  <strong>Not a replacement:</strong> This app is not a replacement for parental supervision or
                  comprehensive parental control software.
                </li>
                <li>
                  <strong>Educational purpose:</strong> This app is primarily for demonstration and educational purposes
                  to show how access alerts could work in a controlled environment.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-destructive" />
                Data Storage & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">All data is stored securely on the Internet Computer blockchain:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  <strong>Child profiles:</strong> Only display names chosen by guardians (no personal information)
                </li>
                <li>
                  <strong>Access logs:</strong> Timestamps and which child profile triggered an alarm
                </li>
                <li>
                  <strong>Guardian PIN:</strong> Stored as a hash (not plain text) and verified server-side
                </li>
                <li>
                  <strong>Principal IDs:</strong> Cryptographic identifiers from Internet Identity (not personally
                  identifiable)
                </li>
              </ul>
              <p className="text-muted-foreground">
                We do not collect email addresses, phone numbers, real names, or any other personally identifiable
                information beyond what you choose to provide as display names.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Questions or Concerns?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If you have questions about how this app works, its limitations, or privacy practices, please review
                this page carefully. This app is provided as-is for educational and demonstration purposes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
