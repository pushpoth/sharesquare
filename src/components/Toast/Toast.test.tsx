// Implements: TASK-036 (REQ-006, REQ-015)

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "./Toast";

function ToastTrigger() {
  const { showToast } = useToast();
  return (
    <button type="button" onClick={() => showToast("Saved", "success")}>
      trigger
    </button>
  );
}

describe("Toast", () => {
  it("throws when useToast is used outside ToastProvider", () => {
    expect(() => render(<ToastTrigger />)).toThrow(/useToast must be used within ToastProvider/);
  });

  it("shows a toast and removes it after auto-dismiss", async () => {
    jest.useFakeTimers();
    let uuid = 0;
    jest.spyOn(crypto, "randomUUID").mockImplementation(() => `toast-id-${uuid++}` as `${string}-${string}-${string}-${string}-${string}`);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "trigger" }));
    expect(screen.getByText("Saved")).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(4000);
    });

    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
    jest.spyOn(crypto, "randomUUID").mockRestore();
    jest.useRealTimers();
  });
});
