#!/usr/bin/env python
import cv2
import numpy as np
import face_recognition
import tornado


class UsbCamera(object):

    """ Init camera """
    def __init__(self):

        # Load a sample picture and learn how to recognize it.
        self.trained_image = face_recognition.load_image_file("training_image/steve.jpg")
        self.trained_face_encoding = face_recognition.face_encodings(self.trained_image)[0]

        # select first video device in system
        self.cam =  cv2.VideoCapture(0)
        
        # set camera resolution
        self.w = 800
        self.h = 600
        
        # set crop factor
        self.cam.set(cv2.CAP_PROP_FRAME_WIDTH, self.h)
        self.cam.set(cv2.CAP_PROP_FRAME_WIDTH, self.w)
       
        # load cascade file
        self.eye_cascade = cv2.CascadeClassifier('haarcascade_eye.xml')
        self.ws = None
        self.viewing = 0
    
    def set_ws(self, ws):
        self.ws = ws

    def set_resolution(self, new_w, new_h):
        """
        functionality: Change camera resolution
        inputs: new_w, new_h - with and height of picture, must be int
        returns: None ore raise exception
        """
        if isinstance(new_h, int) and isinstance(new_w, int):
            # check if args are int and correct
            if (new_w <= 1024) and (new_h <= 786) and \
               (new_w > 0) and (new_h > 0):
                self.h = new_h
                self.w = new_w
            else:
                # bad params
                raise Exception('Bad resolution')
        else:
            # bad params
            raise Exception('Not int value')

    def get_frame(self, fdenable):
        """
        functionality: Gets frame from camera and try to find feces on it
        :return: byte array of jpeg encoded camera frame
        """
        success, image = self.cam.read()
        if success:
            # scale image
            image = cv2.resize(image, (self.w, self.h))

            if fdenable:
                # resize image for speeding up recognize
                frame = cv2.resize(image, (640, 480))
            
                face_locations = face_recognition.face_locations(frame)
                face_encodings = face_recognition.face_encodings(frame, face_locations)

                 # draw rect on face arias
                scale = float(self.w / 640.0)

                # Loop through each face in this frame of video
                for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
                    

                    if self.ws is not None:
                        viewing = len(face_locations)
                        
                        if self.viewing != viewing:
                            self.viewing == viewing
                            self.ws.write_message({'viewing': viewing})

                    # See if the face is a match for the known face(s)
                    match = face_recognition.compare_faces([self.trained_face_encoding], face_encoding)

                    name = None
                    if match[0]:
                        name = "Steve Jobs"

                    top =  int(top * scale)
                    right =  int(right * scale)
                    bottom =  int(bottom * scale)
                    left =  int(left * scale)

                    # Draw a box around the face
                    cv2.rectangle(image, (left, top), (right, bottom + 20), (255, 255, 255), 2)

                    if name:
                        # Draw a label with a name below the face
                        cv2.rectangle(image, (left, bottom), (right, bottom + 45), (0, 255, 0), cv2.FILLED)
                        font = cv2.FONT_HERSHEY_DUPLEX
                        cv2.putText(image, name, (left + 6, bottom + 40), font, 1.0, (255, 255, 255), 1)

        else:
            image = np.zeros((self.h, self.w, 3), np.uint8)
            cv2.putText(image, 'No camera', (40, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 1)
        # encoding picture to jpeg
        ret, jpeg = cv2.imencode('.jpg', image)
        return jpeg.tostring()
