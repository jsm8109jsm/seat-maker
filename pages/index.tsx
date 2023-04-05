import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { DocumentData, collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { fireStore } from "@/config/firebaseConfig";

interface SeatType {
  [x: string]: DocumentData;
}

export default function Home() {
  const bucket = collection(fireStore, "students");
  const [students, setStudents] = useState<SeatType[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const response = await getDocs(bucket);
        const newData: SeatType[] = [];
        response.docs.map((doc) => {
          newData.push(doc.data());
        });
        setStudents(newData);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  console.log(students);
  return (
    <>
      <Head>
        <title>3-2반 자리 뽑기 사이트!</title>
      </Head>
      <div>
        <h1 className={styles.title}>3-2반 자리 뽑기 사이트!</h1>
        <div className={styles.seat_container}>
          {students.map((item, index) => {
            return (
              <div key={index} className={styles.seat}>
                <span>
                  {`32${
                    Number(item.id) > 9
                      ? String(item.id)
                      : "0" + String(item.id)
                  }`}
                </span>
                <span>{String(item.name)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
