import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'API-first',
    description: 'Emisión, validación y envío de facturas desde una sola API REST.',
  },
  {
    title: 'Cumplimiento automático',
    description: 'VeriFactu y SII integrados. Cada factura emitida cumple con la normativa AEAT sin configuración adicional.',
  },
  {
    title: 'Formatos estándar',
    description: 'Exporta en Facturae (XAdES), UBL 2.1 (PEPPOL) y PDF con QR. Importa desde Excel, JSON o XML.',
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md padding-vert--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
