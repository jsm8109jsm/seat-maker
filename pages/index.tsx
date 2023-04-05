import Head from "next/head";
import styles from "@/styles/Home.module.css";
import {
  DocumentData,
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { fireStore } from "@/config/firebaseConfig";

interface SeatType {
  [x: string]: DocumentData | string;
}

export default function Home() {
  const bucket = collection(fireStore, "students");
  const q = query(bucket, orderBy("current_seat"));
  const [students, setStudents] = useState<SeatType[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const response = await getDocs(q);
        let newData: SeatType[] = [];
        response.docs.map((doc) => {
          newData.push(doc.data());
        });
        newData = [
          ...newData.slice(0, 12),
          { name: "빈자리" },
          ...newData.slice(12),
          { name: "빈자리" },
        ];
        setStudents(newData);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  return (
    <>
      <Head>
        <title>3-2반 자리 뽑기 사이트!</title>
      </Head>
      <div>
        <h1 className={styles.title}>3-2반 자리 뽑기 사이트!</h1>
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
      </div>
      <div className={styles.desk}>교탁</div>
    </>
  );
}
