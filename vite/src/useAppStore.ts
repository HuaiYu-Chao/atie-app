import { create } from "zustand";
import ImageStage from "./ImageStage";

interface State {
  imageStage: ImageStage;
  projectionAngles?: number[];
}

const useAppStore = create<State>()((set, get) => ({
  imageStage: null!,
}));

export default useAppStore;
