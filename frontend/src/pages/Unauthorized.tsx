import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="p-4 bg-zinc-900 rounded-full border border-zinc-800">
            <ShieldAlert className="h-16 w-16 text-zinc-100" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-zinc-400 text-lg">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            onClick={() => navigate("/dashboard")}
            className="flex-1 h-12 bg-white text-black hover:bg-zinc-200 cursor-pointer"
          >
            Back to Dashboard
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1 h-12 border-zinc-800 text-black hover:bg-zinc-900 hover:text-white cursor-pointer"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
