import { Link } from "react-router";
import { Button } from "@/components/atoms/ui/button";

function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Button asChild>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
}

export default NotFound;
