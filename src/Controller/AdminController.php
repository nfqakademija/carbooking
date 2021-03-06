<?php
namespace App\Controller;

use App\Entity\Car;
use App\Entity\Comment;
use App\Entity\Image;
use App\Form\CarType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/admin")
 */
class AdminController extends AbstractController
{
    /**
     * @Route("/", name="admin_home")
     */
    public function index()
    {
        return $this->redirectToRoute('admin_cars_show');
    }

    /**
     * @Route("/cars/show", name="admin_cars_show")
     */
    public function showAllCars()
    {
        $cars = $this->getDoctrine()->getRepository(Car::class)
            ->findBy([], ['id' => 'ASC']);

        return $this->render('admin/car/show.html.twig', [
            'cars' => $cars,
        ]);
    }

    /**
     * @Route("/cars/nconfirmed", name="admin_cars_nconfirmed")
     */
    public function showNotConfirmedCars()
    {
        $cars = $this->getDoctrine()->getRepository(Car::class)
            ->findBy(['confirmed' => false]);

        return $this->render('admin/car/show.html.twig', [
            'cars' => $cars,
            'cars_count' => count($cars)
        ]);
    }

    /**
     * @Route("/cars/npublish", name="admin_cars_npublish")
     */
    public function showNotPublishedCars()
    {
        $cars = $this->getDoctrine()->getRepository(Car::class)
            ->findBy(['publish' => false]);

        return $this->render('admin/car/show.html.twig', [
            'cars' => $cars,
            'cars_count' => count($cars)
        ]);
    }

    /**
     * @Route("/car/{car}/edit", name="admin_car_edit")
     * @param Request $request
     * @param Car|null $car
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function editCar(Request $request, Car $car = null)
    {
        if (!$car) {
            throw new NotFoundHttpException("car.not_exists");
        }

        $form = $this->createForm(
            CarType::class,
            $car,
            [
                'action' => $this->generateUrl(
                    'admin_car_edit',
                    [
                        'car' => $car->getId()
                    ]
                )
            ]
        );

        $form->handleRequest($request);
        if ($form->isSubmitted()) {
            if ($form->isValid()) {
                $this->getDoctrine()->getManager()->persist($car);
                $this->getDoctrine()->getManager()->flush();

                $this->addFlash('success', 'car.updated');

                return new RedirectResponse($request->headers->get('referer'));
            }
        }

        return $this->render('admin/car/edit.html.twig', [
            'car' => $car,
            'form' => $form->createView()
        ]);
    }


    /**
     * @Route("/car/{car}/delete", name="admin_car_delete")
     * @param Request $request
     * @param Car|null $car
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function deleteCar(Request $request, Car $car = null)
    {
        if (!$car) {
            throw new NotFoundHttpException("car.not_exists");
        }

        $form = $this->createForm(
            CarType::class,
            $car,
            [
                'action' => $this->generateUrl(
                    'admin_car_delete',
                    [
                        'car' => $car->getId()
                    ]
                )
            ]
        );

        $form->handleRequest($request);
        if ($form->isSubmitted()) {
            if ($form->isValid()) {
                $rentings = $car->getRenting()->toArray();
                foreach ($rentings as $renting) {
                    $this->getDoctrine()->getManager()->remove($renting);
                }

                $comments = $car->getComments()->toArray();
                foreach ($comments as $comment) {
                    $this->getDoctrine()->getManager()->remove($comment);
                }

                $images = $car->getImages()->toArray();
                /** @var Image $image */
                foreach ($images as $image) {
                    $imagePath = 'uploads/' . $image->getImage();
                    if (file_exists($imagePath)) {
                        unlink($imagePath);
                    }

                    $this->getDoctrine()->getManager()->remove($image);
                }

                $bookings = $car->getBookings()->toArray();
                foreach ($bookings as $booking) {
                    $this->getDoctrine()->getManager()->remove($booking);
                }

                $this->getDoctrine()->getManager()->remove($car);
                $this->getDoctrine()->getManager()->flush();

                $this->addFlash('success', 'car.deleted');

                return new RedirectResponse($request->headers->get('referer'));
            }
        }

        return $this->render('admin/car/delete.html.twig', [
            'car' => $car,
            'form' => $form->createView()
        ]);
    }

    /**
     * @Route("/car/{car}/comments", name="admin_car_comments")
     * @param Request $request
     * @param Car|null $car
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function carComments(Request $request, Car $car = null)
    {
        if (!$car) {
            throw new NotFoundHttpException("car.not_exists");
        }

        $comments = $car->getComments()->toArray();

        return $this->render('admin/car/comments.html.twig', [
            'car' => $car,
            'comments' => $comments
        ]);
    }

    /**
     * @Route("/car/{car}/comment/{comment}/delete", name="admin_car_comment_delete")
     * @param Request $request
     * @param Car|null $car
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function deleteCarComment(Request $request, Car $car = null, Comment $comment)
    {
        if (!$car) {
            throw new NotFoundHttpException("car.not_exists");
        }

        $this->getDoctrine()->getManager()->remove($comment);
        $this->getDoctrine()->getManager()->flush();

        $this->addFlash('success', 'comment.deleted');

        return $this->redirectToRoute('admin_cars_show');
    }

    /**
     * @Route("/car/{car}/comments/delete", name="admin_car_comments_delete")
     * @param Request $request
     * @param Car|null $car
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function deleteCarComments(Request $request, Car $car = null)
    {
        if (!$car) {
            throw new NotFoundHttpException("car.not_exists");
        }

        $comments = $car->getComments()->toArray();

        foreach ($comments as $comment) {
            $this->getDoctrine()->getManager()->remove($comment);
        }
        $this->getDoctrine()->getManager()->flush();

        $this->addFlash('success', 'comments.deleted');

        return $this->redirectToRoute('admin_cars_show');
    }
}
