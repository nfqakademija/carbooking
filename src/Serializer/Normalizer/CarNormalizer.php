<?php

namespace App\Serializer\Normalizer;

use App\Entity\Booking;
use App\Entity\Car;
use App\Entity\Image;
use App\Entity\Renting;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

class CarNormalizer implements NormalizerInterface
{
    /**
     * @var EntityManagerInterface
     */
    private $entityManager;

    /**
     * CarNormalizer constructor.
     * @param EntityManagerInterface $entityManager
     */
    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * @param $object
     * @param null $format
     * @param array $context
     * @return array|bool|float|int|string
     */
    public function normalize($object, $format = null, array $context = array())
    {
        return [
            'id'            => $object->getId(),
            'price'         => number_format($object->getPrice(), 2),
            'name'         => $object->getUser()->getName(),
            'phone'         => $object->getUser()->getPhone(),
            'email'         => $object->getUser()->getEmail(),
            'description'   => $object->getDescription(),
            'createdAt'     => $object->getCreatedAt()->format('Y-m-d H:i:s'),
            'address'       => $object->getAddress(),
            'latitude'      => $object->getLatitude(),
            'longitude'     => $object->getLongitude(),
            'city'          => $object->getCity()->getCity(),
            'brand'         => $object->getBrand()->getBrand(),
            'model'         => $object->getModel()->getModel(),
            'images'        => $this->getImages($object),
            'rentDates'     => $this->getRentDates($object),
            'bookingDates'  => $this->getBookings($object)
        ];
    }

    /**
     * @param mixed $data
     * @param null $format
     * @return bool
     */
    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof Car;
    }

    /**
     * @param Car $object
     * @return array
     */
    private function getImages(Car $object): array
    {
        /** @var array $images */
        $images = $object->getImages()->toArray();

        $images = array_map(function (Image $img) {
            return $img->getImage();
        }, $images);

        if (empty($images) || !file_exists($images[0])) {
            return ['images/car-default.jpeg'];
        }

        return $images;
    }

    /**
     * @param Car $object
     * @return array
     */
    private function getRentDates(Car $object): array
    {
        /** @var array $images */
        $rentings = $object->getRenting()->toArray();

        $rentings = array_map(function (Renting $renting) {
            return [
                'id' => $renting->getId(),
                'rentedFrom' => $renting->getRentedFrom()->format('Y-m-d H:i:s'),
                'rentedUntil' => $renting->getRentedUntil()->format('Y-m-d H:i:s')
            ];
        }, $rentings);

        return $rentings;
    }

    /**
     * @param Car $object
     * @return array
     */
    private function getBookings(Car $object): array
    {
        /** @var array $images */
        $bookings = $object->getBookings()->toArray();

        $bookings = array_map(function (Booking $booking) {
            if (!$booking->getApproved()) {
                return null;
            }

            return [
                'id' => $booking->getId(),
                'bookedFrom' => $booking->getBookedFrom()->format('Y-m-d H:i:s'),
                'bookedUntil' => $booking->getBookedUntil()->format('Y-m-d H:i:s')
            ];
        }, $bookings);

        $bookings = array_filter($bookings, function ($obj) {
            return !is_null($obj);
        });

        return $bookings;
    }
}
