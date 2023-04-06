import Head from "next/head";
import styles from "@/styles/Home.module.css";
import {
  DocumentData,
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { fireStore } from "@/config/firebaseConfig";
import domtoimage from "dom-to-image";
import { saveAs } from "file-saver";

interface SeatType {
  [x: string]: DocumentData | string | number;
}

export default function Home() {
  const bucket = collection(fireStore, "students");
  const q = query(bucket, orderBy("current_seat"));
  const [students, setStudents] = useState<SeatType[]>([]);
  const [render, setRender] = useState(false);
  const date = new Date();

  const cardRef = useRef<HTMLDivElement>(null);
  const onDownloadBtn = () => {
    const card = cardRef.current;
    domtoimage.toBlob(card as Node).then((blob) => {
      saveAs(
        blob,
        `${
          date.getMonth() + 1 > 9
            ? date.getMonth() + 1
            : "0" + String(date.getMonth() + 1)
        }${
          date.getDate() > 9 ? date.getDate() : "0" + String(date.getDate())
        } 3-2 자리배치도.png`
      );
    });
  };

  const setEmptySeat = (seats: SeatType[]) => {
    return (seats = [
      ...seats.slice(0, 12),
      { name: "빈자리" },
      ...seats.slice(12),
      { name: "빈자리" },
    ]);
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await getDocs(q);
        let newData: SeatType[] = [];
        response.docs.map((doc) => {
          newData.push({ ...doc.data(), doc_id: doc.id });
        });
        newData = setEmptySeat(newData);
        setStudents(newData);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [render]);

  const shuffle = (array: SeatType[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const shuffleSeats = () => {
    let newStudents = students.filter((student) => student.id);
    shuffle(newStudents);
    newStudents = setEmptySeat(newStudents);
    newStudents.forEach((student) => {
      student.current_seat = newStudents.indexOf(student);
    });
    newStudents.forEach(async (student) => {
      if (student.doc_id) {
        const studentDocRef = doc(
          fireStore,
          "students",
          String(student.doc_id)
        );
        await updateDoc(studentDocRef, student);
      }
    });
    setRender((prev) => !prev);
  };

  return (
    <>
      <Head>
        <title>3-2반 자리 뽑기 사이트!</title>
      </Head>
      <div ref={cardRef} className={styles.background}>
        <h1 className={styles.title}>3-2반 자리 배치도</h1>
        <div className={styles.seat_container}>
          {[...students].reverse().map((item, index) => {
            return (
              <div key={index} className={styles.seat}>
                <span>
                  {item.id
                    ? `32${
                        Number(item.id) > 9
                          ? String(item.id)
                          : "0" + String(item.id)
                      }`
                    : ""}
                </span>
                <span>{String(item.name)}</span>
              </div>
            );
          })}
        </div>
        <div className={styles.desk}>교탁</div>
      </div>
      <div className={styles.buttons}>
        <button onClick={() => shuffleSeats()} className={styles.button}>
          자리 섞기!
        </button>
        <button onClick={() => onDownloadBtn()} className={styles.button}>
          사진 저장!
        </button>
      </div>
    </>
  );
}
