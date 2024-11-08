<?php

namespace Application\abstract;

use Application\controllers\app\Response;
use ReflectionClass;
use ReflectionException;
use Application\models;

abstract class ControlDefaultFunctions
{
    protected $SESSION;
    protected $KLEIN;
    protected $CONNECTION;

    protected $TABLE_NAME;
    protected $TABLE_PRIMARY_ID;
    protected $SEARCH_LOOKUP = [];
    protected $MODEL_CLASS;

    protected $CATEGORY;

    public function __construct()
    {
        global $SESSION;
        global $KLEIN;
        global $CONNECTION;

        $this->SESSION = $SESSION;
        $this->KLEIN = $KLEIN;
        $this->CONNECTION = $CONNECTION;
    }

    /**
     * @throws ReflectionException
     */
    public function newInstanceOfModel($record) {
        return (new ReflectionClass($this->MODEL_CLASS))->newInstance($record);
    }

    /**
     * @throws ReflectionException
     */
    public function get($ID, $AS_OBJECT)
    {
        $activity = $this->CONNECTION->Select($this->TABLE_NAME, [$this->TABLE_PRIMARY_ID => $ID], false);
        return $AS_OBJECT ? $this->newInstanceOfModel($activity) : $activity;
    }

    public function getBy($by,$ID, $AS_OBJECT)
    {
        $activity = $this->CONNECTION->Select($this->TABLE_NAME, [$by => $ID], false);
        return $AS_OBJECT ? $this->newInstanceOfModel($activity) : $activity;
    }

    public function getByWhere($where, $AS_OBJECT)
    {
        $activity = $this->CONNECTION->Select($this->TABLE_NAME, $where, false);
        return $AS_OBJECT ? $this->newInstanceOfModel($activity) : $activity;
    }

    public function getBys($bys, $AS_OBJECT)
    {
        $activity = $this->CONNECTION->Select($this->TABLE_NAME, $bys, false);
        return $AS_OBJECT ? $this->newInstanceOfModel($activity) : $activity;
    }

    public function addWithBranchID($data)
    {
        global $SESSION;

        if (isset($data['branch_id'])) {
            return $this->addRecord($data);
        }

        return $this->addRecord(array_merge(["branch_id" => $SESSION->CURRENT_BRANCH], $data));
    }

    public function addRecord($activity)
    {
        $insert = $this->CONNECTION->Insert($this->TABLE_NAME, $activity, true);

        return new Response($insert ? 200 : 204, $insert ? "Data Successfully Inserted" : "Activity has an error", ['id' => $insert]);
    }

    public function addRecordWithLog($activity, $message = "")
    {
        global $ACTIVITY_CONTROL;

        $insert = $this->CONNECTION->Insert($this->TABLE_NAME, $activity, true);

        $response = new Response($insert ? 200 : 204, $insert ? "Data Successfully Inserted" : "Activity has an error", ['id' => $insert]);

        $ACTIVITY_CONTROL->insert($this->CATEGORY, \ActivityLogActionTypes::INSERT, $response->code, $response->body['id'], $message);

        return $response;
    }

    public function filterTableRecord($data)
    {
        $dateData = $data['dateData'];
        $columnData = $data['columnData'];
        $limitData = $data['limitData'];

        $filter = [];

        if (!empty($dateData['fromDate']) && !empty($dateData['toDate'])) {
//            array_push($filter, [])
        }

        if (count($columnData) > 0) {
            foreach ($columnData as $column) {
                if (!empty($column['column'])) {
                    $filter[] = $column;
                }
            }
        }

        return $this->CONNECTION->FilterMultiConditionBetweenDates($this->TABLE_NAME, $this->TABLE_PRIMARY_ID, $filter, $dateData,  $limitData,true);
    }

    public function addRecordRemoveIfExist($activity)
    {
        $already = $this->alreadyExists($activity);

        if ($already->code == 204) {
            $insert = $this->CONNECTION->Insert($this->TABLE_NAME, $activity, true);
            return new Response($insert ? 200 : 204, $insert ? "Data Successfully Inserted" : "Activity has an error", ['id' => $insert]);
        }


        try {
            $remove = $this->removeRecord($already->body['id']);

            return new Response($remove ? 200 : 204, $remove ? "Data Successfully Deleted" : "UnFavorite has an error", ['id' => -1]);
        } catch (\Exception $exception) {

            return new Response(405, "Failed to delete!");
        }
    }

    public function alreadyExists($record)
    {
        $ID = $this->CONNECTION->Exist($this->TABLE_NAME, $record, $this->TABLE_PRIMARY_ID);

        return new Response($ID ? 200 : 204, $ID ? "Already Exists" : "Not Exists", ["id" => $ID]);
    }

    public function editRecord($id, $record)
    {
        $update = $this->CONNECTION->Update($this->TABLE_NAME, $record, [$this->TABLE_PRIMARY_ID => $id]);
        return new Response($update ? 200 : 204, $update ? "Successfully Edited" : "Updating encounter an error");
    }

    public function editRecordWithLog($id, $record, $message = "")
    {
        global $ACTIVITY_CONTROL;

        $update = $this->CONNECTION->Update($this->TABLE_NAME, $record, [$this->TABLE_PRIMARY_ID => $id]);
        $response =  new Response($update ? 200 : 204, $update ? "Successfully Edited" : "Updating encounter an error");

        $ACTIVITY_CONTROL->insert($this->CATEGORY, \ActivityLogActionTypes::UPDATE, $response->code, $id, $message);

        return $response;
    }

    public function editRecordWhere($where, $record)
    {
        $update = $this->CONNECTION->Update($this->TABLE_NAME, $record, $where);
        return new Response($update ? 200 : 204, $update ? "Successfully Edited" : "Updating encounter an error");
    }

    public function editRecordWhereMulticonditinal($where, $record)
    {
        $update = $this->CONNECTION->UpdateMultiCondition($this->TABLE_NAME, $record, $where);
        return new Response($update ? 200 : 204, $update ? "Successfully Edited" : "Updating encounter an error");
    }

    public function removeRecord($id)
    {
        try {
            $remove = $this->CONNECTION->Delete($this->TABLE_NAME, [$this->TABLE_PRIMARY_ID => $id]);

            return new Response($remove ? 200 : 204, $remove ? "Successfully Removed" : "Removing encounter an error");
        } catch (\Exception $exception) {
            return new Response(400, "Failed to remove");
        }
    }

    public function removeRecordWithLog($id, $message = "")
    {
        global $ACTIVITY_CONTROL;

        $remove = $this->CONNECTION->Delete($this->TABLE_NAME, [$this->TABLE_PRIMARY_ID => $id]);

        $response = new Response($remove ? 200 : 204, $remove ? "Successfully Removed" : "Removing encounter an error");

        $ACTIVITY_CONTROL->insert($this->CATEGORY, \ActivityLogActionTypes::DELETE, $response->code, $id, $message);

        return $response;
    }

    public function removeRecords($ids)
    {
        $success = 0;
        $failed = 0;

        foreach ($ids as $id) {
            $remove = $this->removeRecord($id);

            if ($remove->code === 200) {
                $success++;
            } else {
                $failed++;
            }
        }

        return new Response($success > 0  ? 200 : 204, $success > 0 ? $success . " Successfully Removed, " . $failed . ' Failed' : "Removing encounter an error");
    }

    public function removeRecordsWithLog($ids, $message = "")
    {
        global $ACTIVITY_CONTROL;
        $success = 0;
        $failed = 0;

        foreach ($ids as $id) {
            $remove = $this->removeRecord($id);

            if ($remove->code === 200) {
                $success++;
            } else {
                $failed++;
            }
        }

        $response = new Response($success > 0  ? 200 : 204, $success > 0 ? $success . " Successfully Removed, " . $failed . ' Failed' : "Removing encounter an error");

        $ACTIVITY_CONTROL->insert($this->CATEGORY, \ActivityLogActionTypes::DELETE, $response->code, implode($ids), $message);

        return $response;
    }

    public function NewArrayInstance($records, $asObject) {
        return $asObject ? array_map(/**
         * @throws ReflectionException
         */ function ($record) {
            return $this->newInstanceOfModel($record);
        }, $records) : $records;
    }

    public function getAllRecords($AS_OBJECT)
    {
        $records = $this->CONNECTION->Select($this->TABLE_NAME, null, true);

        return $this->NewArrayInstance($records, $AS_OBJECT);
    }

    public function getAllRecordsWithBranch($AS_OBJECT)
    {
        global $SESSION;

        $branch = $SESSION->getAssignedBranch();

        $records = $this->CONNECTION->Select($this->TABLE_NAME, $SESSION->is(4) ? null : ['branch_id' => $branch->branch_id], true);

        return $this->NewArrayInstance($records, $AS_OBJECT);
    }

    public function getLatestRecords($limit, $AS_OBJECT, $WHERE = null, $col = "date_created")
    {
        $records = $this->CONNECTION->SelectMultiCondition($this->TABLE_NAME, $WHERE, true, $limit, ' ORDER BY ' . $col);

        return $this->NewArrayInstance($records, $AS_OBJECT);
    }

    public function getAllToday($datecol, $AS_OBJECT)
    {
        $records = $this->CONNECTION->SelectToday($this->TABLE_NAME, null, $datecol, true);

        return $this->NewArrayInstance($records, $AS_OBJECT);
    }

    public function getAllTodayWhere($WHERE, $datecol, $AS_OBJECT)
    {
        $records = $this->CONNECTION->SelectToday($this->TABLE_NAME, $WHERE, $datecol, true);

        return $this->NewArrayInstance($records, $AS_OBJECT);
    }

    public function getAllThisWeekWhere($WHERE, $datecol, $AS_OBJECT)
    {
        $records = $this->CONNECTION->SelectThisWeek($this->TABLE_NAME, $WHERE, $datecol, true);

        return $this->NewArrayInstance($records, $AS_OBJECT);
    }

    public function getAllThisYearWhere($WHERE, $datecol, $AS_OBJECT)
    {
        $records = $this->CONNECTION->SelectThisYear($this->TABLE_NAME, $WHERE, $datecol, true);

        return $this->NewArrayInstance($records, $AS_OBJECT);
    }
    public function getAllThisWeek($datecol, $AS_OBJECT)
    {
        $records = $this->CONNECTION->SelectThisWeek($this->TABLE_NAME, null, $datecol, true);

        return $this->NewArrayInstance($records, $AS_OBJECT);
    }

    public function getAllThisYear($datecol, $AS_OBJECT)
    {
        $records = $this->CONNECTION->SelectThisYear($this->TABLE_NAME, null, $datecol, true);

        return $this->NewArrayInstance($records, $AS_OBJECT);
    }

    public function searchRecordsWithBranch($SEARCH, $AS_OBJECT, $WHERE = [])
    {
        global $SESSION;

        $branch = $SESSION->getAssignedBranch();
        $arr = count($WHERE) > 0 ? $WHERE : [];

        $records = $this->CONNECTION->Search($this->TABLE_NAME, $SEARCH, $this->SEARCH_LOOKUP, array_merge($arr, $SESSION->is(4) ? [] : ["branch_id" => $branch->branch_id]));
        return $AS_OBJECT ? array_map(/**
         * @throws ReflectionException
         */ function ($record) {
            return $this->newInstanceOfModel($record);
        }, $records) : $records;
    }

    public function searchRecords($SEARCH, $AS_OBJECT, $WHERE = [])
    {
        $records = $this->CONNECTION->Search($this->TABLE_NAME, $SEARCH, $this->SEARCH_LOOKUP, $WHERE);
        return $AS_OBJECT ? array_map(/**
         * @throws ReflectionException
         */ function ($record) {
            return $this->newInstanceOfModel($record);
        }, $records) : $records;
    }

    public function countRecords($WHERE = null)
    {
        return count($this->CONNECTION->Select($this->TABLE_NAME, $WHERE, true));
    }

    public function filterRecords($WHERE, $AS_OBJECT): array
    {
        $records = $this->CONNECTION->Select($this->TABLE_NAME, count($WHERE) > 0 ? $WHERE : null, true);
        return $AS_OBJECT ? array_map(/**
         * @throws ReflectionException
         */ function ($record) {
            return $this->newInstanceOfModel($record);
        }, $records) : $records;
    }
    public function filterRecordsWithBranch($WHERE, $AS_OBJECT): array
    {
        global $SESSION;

        $branch = $SESSION->getAssignedBranch();
        $arr = count($WHERE) > 0 ? $WHERE : [];

        $records = $this->CONNECTION->Select($this->TABLE_NAME, array_merge($arr, $SESSION->is(4) ? [] : ["branch_id" => $branch->branch_id]) , true);
        return $AS_OBJECT ? array_map(/**
         * @throws ReflectionException
         */ function ($record) {
            return $this->newInstanceOfModel($record);
        }, $records) : $records;
    }
    public function getOnlyRecord($WHERE, $AS_OBJECT)
    {
        $record = $this->CONNECTION->Select($this->TABLE_NAME, count($WHERE) > 0 ? $WHERE : null, false);
        return $AS_OBJECT ? $this->newInstanceOfModel($record) : $record;
    }

}