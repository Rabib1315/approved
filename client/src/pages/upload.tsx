import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload as UploadIcon, FileText, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Upload() {
  const [, setLocation] = useLocation();

  const handleBackToLanding = () => {
    setLocation("/");
  };

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBackToLanding} className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-canadian-red rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🍁</span>
            </div>
            <span className="font-semibold text-gray-800">VisaFlow</span>
          </div>
        </div>
      </header>

      {/* Upload Section */}
      <section className="px-4 py-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-professional-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Documents</h1>
          <p className="text-gray-600 text-sm leading-relaxed">Let's get started by uploading your documents. We'll analyze them and create your personalized checklist.</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Document Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-professional-blue transition-colors cursor-pointer">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Drag and drop your files here, or click to browse</p>
              <p className="text-sm text-gray-500">Supported formats: PDF, JPG, PNG, DOC, DOCX</p>
              <Button className="mt-4 bg-professional-blue hover:bg-blue-700">
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              What happens next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Document Analysis</h3>
                  <p className="text-sm text-gray-600">Our AI will analyze your documents and identify what you have</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Personalized Checklist</h3>
                  <p className="text-sm text-gray-600">Get a custom list of missing documents specific to your situation</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Form Assistance</h3>
                  <p className="text-sm text-gray-600">Get help filling out your application forms correctly</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
