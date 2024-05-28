import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import exampleImage from "./assets/example.jpg";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Separator } from "./components/ui/separator";
import { Slider } from "./components/ui/slider";
import { Switch } from "./components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

function App() {
  const [imageIndex, setImageIndex] = useState(0);
  const stageRef = useRef<Konva.Stage>(null!);

  useEffect(() => {
    stageRef.current = new Konva.Stage({
      container: "konva-container",
      width: 830,
      height: 830,
    });

    return () => {
      stageRef.current.destroy();
    };
  }, []);

  async function showImageAndCropper() {
    const htmlImage = new Image();
    htmlImage.src = exampleImage;
    await htmlImage.decode();

    const layer = new Konva.Layer();
    stageRef.current.add(layer);

    const image = new Konva.Image({ image: htmlImage, x: 15, y: 15 });
    layer.add(image);

    const box = new Konva.Rect({
      x: 15,
      y: 15,
      width: 800,
      height: 800,
      stroke: "lightblue",
      strokeWidth: 1,
      draggable: true,
      fillEnabled: true,
    });
    layer.add(box);

    const transformer = new Konva.Transformer({
      rotateEnabled: false,
      borderEnabled: false,
      anchorSize: 8,
      anchorCornerRadius: 4,
      anchorStroke: "lightblue",
      keepRatio: false,
    });
    transformer.nodes([box]);
    layer.add(transformer);
  }

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={30} className="p-1">
          <Tabs
            defaultValue="crop-image"
            className="flex h-full flex-row gap-1"
          >
            <TabsList className="flex h-full w-32 shrink-0 flex-col justify-start gap-2">
              <TabsTrigger value="crop-image" className="w-full justify-start">
                Crop Image
              </TabsTrigger>
              <TabsTrigger value="reconstruct" className="w-full justify-start">
                Reconstruct
              </TabsTrigger>
            </TabsList>
            <TabsContent value="crop-image" className="flex flex-col gap-1">
              <div className="flex min-h-9 w-80 flex-row items-center gap-1 px-1">
                <Button size="sm" onClick={showImageAndCropper}>
                  Import data
                </Button>
              </div>
              <Separator className="my-1" />
              <div className="flex min-h-9 w-80 flex-row items-center gap-1 px-1">
                <p className="grow text-sm font-semibold">
                  Image No. {imageIndex + 1}
                </p>
                <Slider
                  min={1}
                  max={70}
                  step={1}
                  value={[imageIndex + 1]}
                  className="w-52"
                  onValueChange={([value]) => setImageIndex(value - 1)}
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
            <TabsContent value="reconstruct" className="flex flex-col gap-1">
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
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel
          defaultSize={70}
          className="bg-muted flex items-center justify-center"
        >
          <div id="konva-container" className="h-[830px] w-[830px]" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default App;
