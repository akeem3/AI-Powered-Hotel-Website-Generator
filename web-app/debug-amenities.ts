
import { AmenitiesContract } from './lib/contracts/amenities.contract';
import { mockAmenities } from './components/data/mockAmenities';

const data = {
  variant: {
    layout: 'list',
    columns: 4,
    iconSize: 'medium',
    iconStyle: 'default',
    cardStyle: 'default',
  },
  amenities: mockAmenities,
  showCategory: false,
};

const result = AmenitiesContract.safeParse(data);
if (!result.success) {
  console.log('❌ Validation Failed');
  console.log(JSON.stringify(result.error.issues, null, 2));
} else {
  console.log('✅ Validation Succeeded');
}
