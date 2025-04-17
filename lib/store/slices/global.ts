import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/*interface Criteria {
  id: string;
  name: string;
}*/

interface Item {
  id: string;
  name: string;
}

/*interface Evaluation {
  criteria: Criteria;
  note: number;
  comment?: string;
}*/

const initialState: {
  step: number;
  jury: Item;
  startup: Item;
  problem: Item;
  sections: {
    step: number;
    phase: string;
    questions: {
      criteria: string;
      name: string;
      note: number;
      comment?: string;
    }[];
  }[];
} = {
  step: 1,
  jury: { id: "", name: "" },
  startup: { id: "", name: "" },
  problem: { id: "", name: "" },
  sections: [],
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    changeStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload;
    },
    changeJury: (state, action: PayloadAction<Item>) => {
      state.jury = action.payload;
    },
    changeStartup: (state, action: PayloadAction<Item>) => {
      state.startup = action.payload;
    },
    changeProblem: (state, action: PayloadAction<Item>) => {
      state.problem = action.payload;
    },
    updateAllSection: (
      state,
      action: PayloadAction<{
        sectionStep: number;
        phase: string;
        data: {
          criteria: string;
          name: string;
          note: number;
          comment?: string;
        }[];
      }>,
    ) => {
      const sectionIndex = state.sections.findIndex(
        (elem) => elem.step === action.payload.sectionStep,
      );

      if (sectionIndex !== -1) {
        state.sections[sectionIndex].questions = action.payload.data;
        state.sections[sectionIndex].phase = action.payload.phase;
      } else {
        state.sections.push({
          step: action.payload.sectionStep,
          phase: action.payload.phase,
          questions: action.payload.data,
        });
      }
    },
    resetAll: (state) => {
      state.sections = [];
      state.step = 1;
      state.jury = { id: "", name: "" };
      state.startup = { id: "", name: "" };
      state.problem = { id: "", name: "" };
    },
  },
});

export const {
  changeStep,
  changeJury,
  changeStartup,
  changeProblem,
  updateAllSection,
  resetAll,
} = globalSlice.actions;

export default globalSlice.reducer;
