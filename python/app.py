import cv2
import mediapipe as mp
from controller import Controller
import win32gui
import win32con

cap = cv2.VideoCapture(0)

mpHands = mp.solutions.hands
hands = mpHands.Hands()
mpDraw = mp.solutions.drawing_utils

# Create a named window for the camera feed
cv2.namedWindow('Hand Tracker', cv2.WINDOW_NORMAL)

# Function to set the window always on top
def set_window_on_top(window_name):
    hwnd = win32gui.FindWindow(None, window_name)
    if hwnd:
        win32gui.SetWindowPos(hwnd, win32con.HWND_TOPMOST, 0, 0, 0, 0, win32con.SWP_NOMOVE | win32con.SWP_NOSIZE)

# Main loop
while True:
    success, img = cap.read()
    img = cv2.flip(img, 1)

    imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = hands.process(imgRGB)

    if results.multi_hand_landmarks:
        Controller.hand_Landmarks = results.multi_hand_landmarks[0]
        mpDraw.draw_landmarks(img, Controller.hand_Landmarks, mpHands.HAND_CONNECTIONS)

        Controller.update_fingers_status()
        Controller.cursor_moving()
        Controller.detect_scrolling()
        Controller.detect_zoomming()
        Controller.detect_clicking()
        Controller.detect_dragging()
        Controller.detect_screenshot()  # Added screenshot detection

    cv2.imshow('Hand Tracker', img)
    set_window_on_top('Hand Tracker')  # Ensure the window stays on top

    if cv2.waitKey(5) & 0xff == 27:
        break

cap.release()
cv2.destroyAllWindows()