import styled from '@emotion/styled';
import colors from 'client/styles/colors';
import { brand } from 'client/config/brand';

const Panel = styled.section`
  width: 95vw; max-width: 72rem; margin: 1rem auto; padding: 1.5rem;
  border: 1px solid ${colors.primary}; border-radius: 10px;
  background: linear-gradient(135deg, ${colors.backgroundLighter}, ${colors.backgroundDarker});
  box-shadow: 4px 4px 0 ${colors.bgShadowColor};
  h2 { margin: 0 0 0.5rem; color: ${colors.primary}; }
  p { margin: 0.4rem 0; line-height: 1.55; }
  .actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1rem; }
  a { display: inline-block; padding: 0.7rem 1rem; border: 1px solid ${colors.primary};
    border-radius: 6px; color: ${colors.textColor}; text-decoration: none; font-weight: 700; }
  a.primary { background: ${colors.primary}; color: ${colors.backgroundDarker}; }
`;

const GrowthCta = (): JSX.Element => (
  <Panel>
    <h2>Your website is only one part of discovery</h2>
    <p>Customers increasingly use search and AI assistants to find specialist stores, products and local businesses. MultiHub GEO helps independent businesses make their websites easier to understand, trust and recommend.</p>
    <div className="actions">
      <a className="primary" href={brand.website} target="_blank" rel="noreferrer">Get a free discovery review</a>
      {brand.whatsapp && <a href={brand.whatsapp} target="_blank" rel="noreferrer">Contact on WhatsApp</a>}
      {brand.facebookGroup && <a href={brand.facebookGroup} target="_blank" rel="noreferrer">Join our Facebook group</a>}
    </div>
  </Panel>
);

export default GrowthCta;
