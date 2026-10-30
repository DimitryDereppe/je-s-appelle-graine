import Image from "next/image";
import styles from "./Commitments.module.css";

const features = [
  {
    id: 1,
    title: "Des arbres sélectionnés",
    icon: "/assets/arbres-selectionnes.png",
  },
  {
    id: 2,
    title: "Des projets de plantation",
    icon: "/assets/projets-plantation.png",
  },
  {
    id: 3,
    title: "Un suivi transparent",
    icon: "/assets/suivi-transparent.png",
  },
];

export default function Commitments() {
  return (
    <section className={styles.commitments} aria-label="Nos engagements">
      <ul className={styles.list}>
        {features.map((feature) => (
          <li className={styles.item} key={feature.id}>
            <Image
              src={feature.icon}
              alt=""
              aria-hidden="true"
              width={24}
              height={24}
            />
            <span>{feature.title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
