import { createGlobalStyle } from "styled-components/macro";

const GlobalStyle = createGlobalStyle<any>`
  html,
  body,
  #root {
    height: 100%;
    overflow-x: hidden;
  }

  body {
    background: ${(props) => props.theme.palette.background.default};
    margin: 0;
  }

  .MuiCardHeader-action .MuiIconButton-root {
    padding: 4px;
    width: 28px;
    height: 28px;

    /* Fix DateTimePicker popper positioning */
    .MuiPopper-root {
      z-index: 1300 !important;
    }

    .MuiModal-root {
      z-index: 1200 !important;

      /* Ensure DateTimePicker calendar opens from the input field */
      .MuiPickersPopper-root {
        z-index: 1300 !important;
      }

      .MuiDateCalendar-root {
        position: relative !important;
      }

      /* Prevent overflow constraints on Grid containers */
      .MuiGrid-item {
        overflow: visible !important;
      }
    }
  }
`;

export default GlobalStyle;
