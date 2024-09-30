<?php

namespace Application\core;

use Application\abstracts\MessageAbstract;
use Application\controllers\app\Response;
use Application\controllers\system\MessageControl;
use Application\controllers\system\UserProfileControl;

class Routes
{
    protected $KLEIN;
    protected $CONNECT;
    protected $SESSION;
    protected $APPLICATION;

    public function __construct($APPLICATION)
    {
        global $CONNECTION;
        global $KLEIN;
        global $SESSION;

        $this->CONNECT = $CONNECTION;
        $this->KLEIN = $KLEIN;
        $this->SESSION = $SESSION;
        $this->APPLICATION = $APPLICATION;
    }

    public function loadRoutes(): void
    {
        $KLEIN = $this->KLEIN;
        $SESSION = $this->SESSION;

        // if no currently login in session
        if (!$SESSION->hasUser) {
            // routes for authentication
            $this->authenticationRoutes();
        } else if ($SESSION->isAdmin) {
            $this->applicationRoutes();
        }

        $this->apiRoutes();
        $this->toolRoutes();
        $this->componentsRoutes();
        $KLEIN->dispatch();
    }

    private function authenticationRoutes(): void
    {
        $KLEIN = $this->KLEIN;
        $SESSION = $this->SESSION;

        if (!$this->SESSION->hasUser){
            $KLEIN->with("", function () use ($KLEIN, $SESSION) {
                $KLEIN->respond("GET", "?", function ($req, $res) use ($SESSION) {
                    if (!$SESSION->hasUser) {
                        $res->redirect("/login");
                    }
                });

                $KLEIN->respond(
                    "GET",
                    "[/?|!@^/login]",
                    function ($req, $res) use ($SESSION) {
                        if ($SESSION->hasUser) {
                            $res->redirect("/");
                        } else {
                            return $res->redirect("/login");
                        }
                    }
                );


                $KLEIN->respond(
                    "GET",
                    "/[:page]",
                    function ($req, $res, $service) use ($SESSION) {
                        $view = $req->param("page");
                        $viewPath = "public/views/auth/" . $view . ".phtml";
                        $exist = file_exists($viewPath);

                        if ($exist) {
                            return $service->render($viewPath);
                        } else {
                            $res->redirect("/login");
                        }
                    }
                );

            });
        }
    }

    private function applicationRoutes(): void
    {
        $KLEIN = $this->KLEIN;

        $TYPE = $this->SESSION->typeName;

        $this->KLEIN->with("", static function () use ($KLEIN, $TYPE) {
            $defaultView = "public/views/pages/$TYPE/dashboard.phtml";
            $mustview = "public/views/pages/$TYPE/";

            $KLEIN->respond(
                "GET",
                "/?",
                static function ($req, $res, $service) use ($defaultView) {
                    return $service->render($defaultView, ["view_path" => "/"]);
                }
            );

            $KLEIN->respond(
                "GET",
                "/[:view]",
                static function ($req, $res, $service) use ($defaultView, $mustview) {
                    $view = $mustview . $req->param("view") . ".phtml";

                    if ($req->param("view") == "logout") {
                        $view = "public/views/pages/logout.phtml";
                    }

                    return $service->render(file_exists($view) ? $view : $defaultView, ["view_path" => $req->param("view")]);
                }
            );

            $KLEIN->respond(
                "GET",
                "/[:view]/[:subview]",
                static function ($req, $res, $service) use ($defaultView, $mustview) {
                    $view = $mustview . $req->param("view") . "/" .$req->param("subview"). ".phtml";

                    return $service->render(file_exists($view) ? $view : $defaultView, ["view_path" => $req->param("view") . "/" .$req->param("subview")]);
                }
            );
        });
    }

    private function apiRoutes(): void
    {
        $KLEIN = $this->KLEIN;
        $APPLICATION = $this->APPLICATION;
        $SESSION = $this->SESSION;

        $this->KLEIN->with("/api", function () use ($KLEIN, $APPLICATION, $SESSION) {

            $this->KLEIN->with("/admin", function () use ($KLEIN, $APPLICATION) {
                $KLEIN->respond("/[:view]/updateRecords", function ($req, $res, $service) {
                    return $service->render("public/views/components/popup/" . $req->param("view") . '/updateRecords.phtml');
                }
                );

                $KLEIN->respond("/[:view]/searchRecords", function ($req, $res, $service) {
                    return $service->render("public/views/components/popup/" . $req->param("view") . '/searchRecords.phtml');
                }
                );

                $KLEIN->respond("/[:view]/filterRecords", function ($req, $res, $service) {
                    return $service->render("public/views/components/popup/" . $req->param("view") . '/filterRecords.phtml');
                }
                );

                // DITO KA MAG AADDD NG MGA FUNCTIONS NG BAWAT TABLE SA DATABASE


                $KLEIN->with("/users", function () use ($KLEIN, $APPLICATION) {
                    $KLEIN->respond("POST", "/addRecord", function () use ($APPLICATION) {
                        return json_encode($APPLICATION->FUNCTIONS->{"USER_CONTROL"}->add(json_decode($_POST["data"], true)));
                    });

                    $KLEIN->respond("POST", "/editRecord", function () use ($APPLICATION) {
                        return json_encode($APPLICATION->FUNCTIONS->{"USER_CONTROL"}->editRecord($_POST['id'], json_decode($_POST["data"], true)));
                    });

                    $KLEIN->respond("POST", "/removeRecords", function () use ($APPLICATION) {
                        return json_encode($APPLICATION->FUNCTIONS->{"USER_CONTROL"}->removeRecords(json_decode($_POST["data"], true)));
                    });
                });

                $KLEIN->with("/sections", function () use ($KLEIN, $APPLICATION) {
                    $KLEIN->respond("POST", "/addRecord", function () use ($APPLICATION) {
                        return json_encode($APPLICATION->FUNCTIONS->{"SECTION_CONTROL"}->add(json_decode($_POST["data"], true)));
                    });

                    $KLEIN->respond("POST", "/editRecord", function () use ($APPLICATION) {
                        return json_encode($APPLICATION->FUNCTIONS->{"SECTION_CONTROL"}->edit(json_decode($_POST["data"], true)));
                    });

                    $KLEIN->respond("POST", "/removeRecords", function () use ($APPLICATION) {
                        return json_encode($APPLICATION->FUNCTIONS->{"SECTION_CONTROL"}->removeRecords(json_decode($_POST["data"], true)));
                    });
                });

                $ALL_SAME_FUNCTIONS = [
                    [
                        "path" => "/courses",
                        "control" => "COURSE_CONTROL"
                    ],
                    [
                        "path" => "/professors",
                        "control" => "PROFESSOR_CONTROL"
                    ],
                    [
                        "path" => "/classrooms",
                        "control" => "CLASSROOM_CONTROL"
                    ],
                    [
                        "path" => "/subjects",
                        "control" => "SUBJECT_CONTROL"
                    ],
                ];
//
                foreach ($ALL_SAME_FUNCTIONS as $FUNCTION) {
                    $KLEIN->with($FUNCTION['path'], function () use ($KLEIN, $APPLICATION, $FUNCTION) {
                        $KLEIN->respond("POST", "/addRecord", function () use ($APPLICATION, $FUNCTION) {
                            return json_encode($APPLICATION->FUNCTIONS->{$FUNCTION['control']}->addRecord(json_decode($_POST["data"], true)));
                        });

                        $KLEIN->respond("POST", "/editRecord", function () use ($APPLICATION, $FUNCTION) {
                            return json_encode($APPLICATION->FUNCTIONS->{$FUNCTION['control']}->editRecord($_POST['id'], json_decode($_POST["data"], true)));
                        });

                        $KLEIN->respond("POST", "/removeRecords", function () use ($APPLICATION, $FUNCTION) {
                            return json_encode($APPLICATION->FUNCTIONS->{$FUNCTION['control']}->removeRecords(json_decode($_POST["data"], true)));
                        });
                    });
                }
            });

            $this->KLEIN->with("/post", function () use ($KLEIN, $APPLICATION) {
                $KLEIN->respond("POST", "/[:request]", function ($req) use ($APPLICATION) {
                    return json_encode($APPLICATION->FUNCTIONS->POST_CONTROL->run($req->param("request")));
                });
            });
        });
    }

    private function componentsRoutes(): void
    {
        $KLEIN = $this->KLEIN;

        $KLEIN->respond("POST", "/components/popup/[:folder]?/[:view]?", static function ($req, $res, $service) use ($KLEIN) {
            $mainPath = "public/views/components/popup/" . $req->param("folder") . '/';
            $view = $mainPath . $req->param("view") . '.phtml';
            return file_exists($view) ? $service->render($view) : null;
        });

        $KLEIN->respond("POST", "/components/containers/[:folder]?/[:view]?", static function ($req, $res, $service) use ($KLEIN) {
            $mainPath = "public/views/components/containers/" . $req->param("folder") . '/';
            $view = $mainPath . $req->param("view") . '.phtml';
            return file_exists($view) ? $service->render($view) : null;
        });
    }

    private function toolRoutes()
    {
        $KLEIN = $this->KLEIN;

        $KLEIN->with("/tool", function () use ($KLEIN) {
            $KLEIN->respond(
                "POST",
                "/uploadImageFromFile",
                function () {
                    return json_encode(UploadImageFromFile($_FILES['file'], $_POST["filename"], $_POST['destination']), JSON_THROW_ON_ERROR);
                }
            );

            $KLEIN->respond(
                "POST",
                "/uploadImageFromPath",
                function () {
                    return json_encode(UploadImageFromPath($_POST['path'], $_POST["filename"], $_POST['destination']), JSON_THROW_ON_ERROR);
                }
            );

            $KLEIN->respond(
                "POST",
                "/uploadImageFromBase64",
                function () {
                    return json_encode(UploadImageFromBase64($_POST['base64'], $_POST['destination'], $_POST["filename"], $_POST['extension'] ?? 'jpg'), JSON_THROW_ON_ERROR);
                }
            );

            $KLEIN->respond(
                "POST",
                "/UploadFileFromFile",
                function () {
                    return json_encode(UploadFileFromFile($_FILES['file'], $_POST['destination'], $_POST['filename']), JSON_THROW_ON_ERROR);
                }
            );
        });
    }
}