import { useEffect, useState } from "react";
import { toast } from "sonner";
import ImageStage from "./ImageStage";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Separator } from "./components/ui/separator";
import { Slider } from "./components/ui/slider";
import { Toaster } from "./components/ui/sonner";
import { Switch } from "./components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { addMatlabEventListener, sendEventToMatlab } from "./matlab";
import useAppStore from "./useAppStore";

function App() {
  useEffect(() => {
    const stage = new ImageStage("image-stage-container");
    useAppStore.setState({ imageStage: stage });

    addMatlabEventListener(
      "projectionDataLoaded",
      async (data: { projectionDataUrls: string[]; angles: number[] }) => {
        useAppStore.setState({ projectionAngles: data.angles });
        toast(data.projectionDataUrls[0]);
        await useAppStore
          .getState()
          .imageStage.loadProjections(data.projectionDataUrls);
      },
    );

    return () => {
      useAppStore.getState().imageStage.destroy;
    };
  }, []);

  const projectionAngles = useAppStore((state) => state.projectionAngles);

  const [imageIndex, setImageIndex] = useState(0);

  return (
    <div className="flex h-screen w-screen flex-row">
      <Tabs
        defaultValue="crop-image"
        className="flex h-full flex-row gap-1 py-1 pl-1"
      >
        <TabsList className="flex h-full w-32 flex-col justify-start gap-2">
          <TabsTrigger value="crop-image" className="w-full justify-start">
            Crop Image
          </TabsTrigger>
          <TabsTrigger value="reconstruct" className="w-full justify-start">
            Reconstruct
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="crop-image"
          className="flex flex-col gap-1 overflow-y-auto"
        >
          <div className="flex min-h-9 w-80 flex-row items-center justify-end gap-1 px-1">
            <Button
              size="sm"
              onClick={() => {
                sendEventToMatlab("selectAndLoadProjectionData");
              }}
              className="w-full"
            >
              Load Data
            </Button>
          </div>
          <Separator className="my-1" />
          <div className="flex min-h-9 w-80 flex-row items-center gap-1 px-1">
            <p className="grow text-sm font-semibold">
              Image No. {imageIndex + 1} (
              {projectionAngles?.[imageIndex].toFixed(1) ?? "--"}°)
            </p>
            <Slider
              min={1}
              max={projectionAngles?.length ?? 2}
              step={1}
              value={[imageIndex + 1]}
              disabled={projectionAngles === undefined}
              className="w-40"
              onValueChange={([value]) => {
                const index = value - 1;
                setImageIndex(index);
                useAppStore.getState().imageStage.setDisplayedProjection(index);
              }}
            />
          </div>
          <div className="flex min-h-9 w-80 flex-row items-center justify-end gap-1 px-1">
            <p className="grow text-sm font-semibold">Stack all images</p>
            <Switch />
          </div>
          <div className="flex min-h-9 w-80 flex-row items-center justify-end gap-1 px-1">
            <Button size="sm">Apply crop</Button>
          </div>
        </TabsContent>
        <TabsContent
          value="reconstruct"
          className="flex flex-col gap-1 overflow-y-auto"
        >
          <div className="flex min-h-9 w-80 flex-row items-center gap-1 px-1">
            <p className="grow text-sm font-semibold">Algorithm</p>
            <Select defaultValue="atie">
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="atie">a-TIE</SelectItem>
                <SelectItem value="resire">RESIRE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex min-h-9 w-80 flex-row items-center gap-1 px-1">
            <p className="grow text-sm font-semibold">N iterations</p>
            <Input defaultValue="50" className="w-36" />
          </div>
          <div className="flex min-h-9 w-80 flex-row items-center gap-1 px-1">
            <p className="grow text-sm font-semibold">Float type</p>
            <Select defaultValue="single">
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">single</SelectItem>
                <SelectItem value="double">double</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex min-h-9 w-80 flex-row items-center gap-1 px-1">
            <p className="grow text-sm font-semibold">Padding ratio</p>
            <Input placeholder="sqrt(2)" className="w-36" />
          </div>
          <Separator className="my-1" />
          <div className="flex min-h-9 w-80 flex-row items-center justify-end gap-1 px-1">
            <Button size="sm" variant="destructive">
              ABORT
            </Button>
            <Button size="sm">Start reconstruction</Button>
          </div>
        </TabsContent>
      </Tabs>
      <div
        id="image-stage-container"
        className="flex-grow overflow-hidden bg-muted"
      ></div>
      <Button
        size="sm"
        variant="outline"
        className="fixed bottom-2 left-2"
        onClick={() => {
          sendEventToMatlab("reloadHtml");
        }}
      >
        Reload
      </Button>
      <Toaster />
    </div>
  );
}

export default App;
